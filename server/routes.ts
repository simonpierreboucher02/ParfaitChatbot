import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createEmbedding, chunkText } from "./openai";
import { streamChatCompletion } from "./openrouter";
import { crawlWebsite, extractTextFromFile } from "./crawler";
import { vectorStore } from "./vectorStore";
import multer from "multer";
import { randomUUID } from "crypto";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Company endpoints
  app.get("/api/company", async (req: Request, res: Response) => {
    try {
      const company = await storage.getCompany();
      res.json(company || null);
    } catch (error) {
      console.error("Error getting company:", error);
      res.status(500).json({ error: "Failed to get company" });
    }
  });

  app.put("/api/company", async (req: Request, res: Response) => {
    try {
      const company = await storage.createOrUpdateCompany(req.body);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ error: "Failed to update company" });
    }
  });

  // Chatbot endpoints
  app.get("/api/chatbot", async (req: Request, res: Response) => {
    try {
      let chatbot = await storage.getChatbot();
      
      // Create default chatbot if none exists
      if (!chatbot) {
        const company = await storage.getCompany();
        if (company) {
          chatbot = await storage.createOrUpdateChatbot({
            companyId: company.id,
            name: "AI Assistant",
            personality: "professional",
            language: "en",
            primaryColor: "#8b5cf6",
            position: "right",
            llmModel: "openai/gpt-5",
            temperature: "0.7",
            systemPrompt: "You are a helpful AI assistant.",
          });
        }
      }
      
      res.json(chatbot || null);
    } catch (error) {
      console.error("Error getting chatbot:", error);
      res.status(500).json({ error: "Failed to get chatbot" });
    }
  });

  app.put("/api/chatbot", async (req: Request, res: Response) => {
    try {
      const chatbot = await storage.createOrUpdateChatbot(req.body);
      res.json(chatbot);
    } catch (error) {
      console.error("Error updating chatbot:", error);
      res.status(500).json({ error: "Failed to update chatbot" });
    }
  });

  // Document endpoints
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error getting documents:", error);
      res.status(500).json({ error: "Failed to get documents" });
    }
  });

  app.post("/api/documents/upload", upload.array("files"), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const company = await storage.getCompany();
      if (!company) {
        return res.status(400).json({ error: "Company not found" });
      }

      const results = [];

      for (const file of files) {
        const text = await extractTextFromFile(file.buffer, file.mimetype);
        
        const document = await storage.createDocument({
          companyId: company.id,
          title: file.originalname,
          content: text,
          sourceType: "upload",
          sourceUrl: null,
          fileUrl: null,
        });

        // Create embeddings using FAISS
        const chunks = await chunkText(text);
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await createEmbedding(chunks[i]);
          const embeddingId = randomUUID();
          
          // Store in database for reference
          await storage.createEmbedding({
            documentId: document.id,
            chunkText: chunks[i],
            chunkIndex: i,
            embedding: embeddingId, // Store FAISS ID reference
          });
          
          // Add to vector store
          vectorStore.addEmbedding(embeddingId, document.id, chunks[i], i, embedding);
        }

        results.push(document);
      }

      res.json(results);
    } catch (error) {
      console.error("Error uploading documents:", error);
      res.status(500).json({ error: "Failed to upload documents" });
    }
  });

  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      // Delete from vector store
      vectorStore.deleteByDocumentId(req.params.id);
      
      // Delete from database
      await storage.deleteDocument(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Crawl endpoint
  app.post("/api/crawl", async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      const company = await storage.getCompany();
      if (!company) {
        return res.status(400).json({ error: "Company not found" });
      }

      // Crawl website and wait for completion
      const pages = await crawlWebsite(url, 10);
      
      if (pages.length === 0) {
        return res.status(400).json({ 
          error: "No content found. The website may be blocking crawlers or the URL is invalid." 
        });
      }

      const results = [];

      for (const page of pages) {
        const document = await storage.createDocument({
          companyId: company.id,
          title: page.title,
          content: page.content,
          sourceType: "crawl",
          sourceUrl: page.url,
          fileUrl: null,
        });

        // Create embeddings
        const chunks = await chunkText(page.content);
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await createEmbedding(chunks[i]);
          const embeddingId = randomUUID();
          
          // Store in database for reference
          await storage.createEmbedding({
            documentId: document.id,
            chunkText: chunks[i],
            chunkIndex: i,
            embedding: embeddingId,
          });
          
          // Add to vector store
          vectorStore.addEmbedding(embeddingId, document.id, chunks[i], i, embedding);
        }

        results.push(document);
      }

      res.json({ 
        success: true, 
        message: `Successfully crawled ${pages.length} page(s)`,
        documents: results 
      });
    } catch (error) {
      console.error("Error crawling website:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to crawl website" 
      });
    }
  });

  // Chat endpoint with streaming
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, sessionId } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const chatbot = await storage.getChatbot();
      if (!chatbot) {
        return res.status(400).json({ error: "Chatbot not configured" });
      }

      // Create or get conversation
      const session = sessionId || randomUUID();
      let conversation = await storage.getConversation(session);
      
      if (!conversation) {
        conversation = await storage.createConversation({
          chatbotId: chatbot.id,
          sessionId: session,
          visitorIp: req.ip || "unknown",
          visitorCountry: null,
          visitorCity: null,
        });
      }

      // Save user message
      await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content: message,
        citations: null,
      });

      // Create query embedding and search using vector store
      const queryEmbedding = await createEmbedding(message);
      const vectorResults = vectorStore.search(queryEmbedding, 3);
      
      // Get document details from database
      const relevantChunks = await Promise.all(
        vectorResults.map(async (result) => {
          const docs = await storage.getDocuments();
          const doc = docs.find(d => d.id === result.documentId);
          return {
            ...result,
            document: doc || { title: "Unknown", sourceUrl: null },
          };
        })
      );

      // Build context
      const context = relevantChunks
        .map((chunk) => `[${chunk.document.title}] ${chunk.chunkText}`)
        .join("\n\n");

      // Build messages for LLM
      const systemPrompt = chatbot.systemPrompt || "You are a helpful AI assistant.";
      const messages = [
        { role: "system" as const, content: `${systemPrompt}\n\nContext from knowledge base:\n${context}` },
        { role: "user" as const, content: message },
      ];

      // Stream response
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let fullResponse = "";

      for await (const chunk of streamChatCompletion(
        messages,
        chatbot.llmModel,
        parseFloat(chatbot.temperature || "0.7")
      )) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      // Save assistant message
      const citations = relevantChunks.map((chunk) => ({
        title: chunk.document.title,
        url: chunk.document.sourceUrl,
      }));

      await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: fullResponse,
        citations,
      });

      res.write(`data: ${JSON.stringify({ done: true, sessionId: session })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Conversation endpoints
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error getting conversations:", error);
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // Stats and Analytics
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  app.get("/api/analytics", async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error getting analytics:", error);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
