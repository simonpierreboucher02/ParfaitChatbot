import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createEmbedding, chunkText } from "./openai";
import { streamChatCompletion } from "./openrouter";
import { crawlWebsite, extractTextFromFile } from "./crawler";
import { vectorStore } from "./vectorStore";
import { getLocationFromIP } from "./geoip";
import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve widget.js
  app.get("/widget.js", (req: Request, res: Response) => {
    const widgetPath = path.join(process.cwd(), "public", "widget.js");
    if (fs.existsSync(widgetPath)) {
      res.setHeader("Content-Type", "application/javascript");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.sendFile(widgetPath);
    } else {
      res.status(404).send("Widget not found");
    }
  });
  
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

  // Logo upload endpoint
  app.post("/api/company/logo", upload.single("logo"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Invalid file type. Only images are allowed." });
      }

      // Import fs for file operations
      const fs = await import("fs");
      const path = await import("path");
      
      // Get public directory from env
      const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS?.split(",") || [];
      if (publicPaths.length === 0) {
        return res.status(500).json({ error: "Object storage not configured" });
      }

      const publicDir = publicPaths[0];
      const fileName = `logo-${Date.now()}${path.extname(file.originalname)}`;
      const filePath = path.join(publicDir, fileName);

      // Save file to object storage
      fs.writeFileSync(filePath, file.buffer);

      // Get bucket ID to construct URL
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketId) {
        return res.status(500).json({ error: "Object storage bucket ID not configured" });
      }
      
      const logoUrl = `https://storage.googleapis.com/${bucketId}/public/${fileName}`;

      // Update company with new logo URL
      const company = await storage.getCompany();
      if (company) {
        const updated = await storage.createOrUpdateCompany({
          ...company,
          logoUrl,
        });
        res.json({ logoUrl: updated.logoUrl });
      } else {
        res.json({ logoUrl });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ error: "Failed to upload logo" });
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
      const { url, crawlerType = "internal" } = req.body;
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

      // Choose crawler based on type
      let pages: { url: string; title: string; content: string }[];
      
      if (crawlerType === "exa") {
        const { exaCrawlWebsite } = await import("./exa-crawler");
        pages = await exaCrawlWebsite(url, 10);
      } else {
        pages = await crawlWebsite(url, 10);
      }
      
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
          sourceType: crawlerType === "exa" ? "exa-crawl" : "crawl",
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
        message: `Successfully crawled ${pages.length} page(s) using ${crawlerType === "exa" ? "Exa AI" : "internal crawler"}`,
        documents: results 
      });
    } catch (error) {
      console.error("Error crawling website:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to crawl website";
      
      // Handle configuration errors as 400
      if (errorMessage.includes("EXA_API_KEY") || 
          errorMessage.includes("API key") ||
          errorMessage.includes("authentication")) {
        return res.status(400).json({ error: errorMessage });
      }
      
      // Handle user-facing errors (content extraction failures, rate limits, blocked domains) as 422
      if (errorMessage.includes("No content could be extracted") || 
          errorMessage.includes("blocking crawlers") ||
          errorMessage.includes("no text content") ||
          errorMessage.includes("Exa crawl failed") ||
          errorMessage.includes("rate limit") ||
          errorMessage.includes("domain restricted") ||
          errorMessage.includes("cannot access")) {
        return res.status(422).json({ error: errorMessage });
      }
      
      // All other errors as 500
      res.status(500).json({ error: errorMessage });
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
        // Get visitor location from IP
        const clientIp = req.ip || "unknown";
        const location = await getLocationFromIP(clientIp);
        
        conversation = await storage.createConversation({
          chatbotId: chatbot.id,
          sessionId: session,
          visitorIp: clientIp,
          visitorCountry: location.country,
          visitorCity: location.city,
          visitorLat: location.lat ? location.lat.toString() : null,
          visitorLon: location.lon ? location.lon.toString() : null,
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
