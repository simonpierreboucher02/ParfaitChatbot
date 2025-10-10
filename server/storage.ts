// Referenced from javascript_database blueprint
import {
  companies,
  chatbots,
  documents,
  embeddings,
  conversations,
  messages,
  crawlerConfigs,
  type Company,
  type InsertCompany,
  type Chatbot,
  type InsertChatbot,
  type Document,
  type InsertDocument,
  type Embedding,
  type InsertEmbedding,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type CrawlerConfig,
  type InsertCrawlerConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, gt } from "drizzle-orm";

export interface IStorage {
  // Company operations
  getCompany(): Promise<Company | undefined>;
  createOrUpdateCompany(company: InsertCompany): Promise<Company>;

  // Chatbot operations
  getChatbot(): Promise<Chatbot | undefined>;
  createOrUpdateChatbot(chatbot: InsertChatbot): Promise<Chatbot>;

  // Document operations
  getDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Embedding operations
  createEmbedding(embedding: InsertEmbedding): Promise<Embedding>;
  searchEmbeddings(queryEmbedding: number[], limit?: number): Promise<Array<Embedding & { document: Document }>>;

  // Conversation operations
  getConversations(): Promise<Array<Conversation & { messageCount: number }>>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  // Message operations
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Crawler operations
  getCrawlerConfig(): Promise<CrawlerConfig | undefined>;
  createOrUpdateCrawlerConfig(config: InsertCrawlerConfig): Promise<CrawlerConfig>;

  // Stats
  getStats(): Promise<any>;
  getAnalytics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getCompany(): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).limit(1);
    return company || undefined;
  }

  async createOrUpdateCompany(insertCompany: InsertCompany): Promise<Company> {
    const existing = await this.getCompany();
    
    if (existing) {
      const [updated] = await db
        .update(companies)
        .set(insertCompany)
        .where(eq(companies.id, existing.id))
        .returning();
      return updated;
    }

    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async getChatbot(): Promise<Chatbot | undefined> {
    const [chatbot] = await db.select().from(chatbots).limit(1);
    return chatbot || undefined;
  }

  async createOrUpdateChatbot(insertChatbot: InsertChatbot): Promise<Chatbot> {
    const existing = await this.getChatbot();
    
    if (existing) {
      const [updated] = await db
        .update(chatbots)
        .set(insertChatbot)
        .where(eq(chatbots.id, existing.id))
        .returning();
      return updated;
    }

    const company = await this.getCompany();
    if (!company) {
      throw new Error("Company must be created first");
    }

    const [chatbot] = await db
      .insert(chatbots)
      .values({ ...insertChatbot, companyId: company.id })
      .returning();
    return chatbot;
  }

  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async createEmbedding(insertEmbedding: InsertEmbedding): Promise<Embedding> {
    const [embedding] = await db
      .insert(embeddings)
      .values(insertEmbedding)
      .returning();
    return embedding;
  }

  async searchEmbeddings(queryEmbedding: number[], limit: number = 5): Promise<Array<Embedding & { document: Document }>> {
    // Simple cosine similarity search
    // In production, use pgvector or dedicated vector DB
    const allEmbeddings = await db
      .select()
      .from(embeddings)
      .innerJoin(documents, eq(embeddings.documentId, documents.id));

    const results = allEmbeddings
      .map((row) => {
        const storedEmbedding = JSON.parse(row.embeddings.embedding);
        const similarity = this.cosineSimilarity(queryEmbedding, storedEmbedding);
        return {
          ...row.embeddings,
          document: row.documents,
          similarity,
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async getConversations(): Promise<Array<Conversation & { messageCount: number }>> {
    const convs = await db
      .select({
        conversation: conversations,
        messageCount: count(messages.id),
      })
      .from(conversations)
      .leftJoin(messages, eq(conversations.id, messages.conversationId))
      .groupBy(conversations.id)
      .orderBy(desc(conversations.createdAt));

    return convs.map((c) => ({
      ...c.conversation,
      messageCount: Number(c.messageCount),
    }));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getCrawlerConfig(): Promise<CrawlerConfig | undefined> {
    const [config] = await db.select().from(crawlerConfigs).limit(1);
    return config || undefined;
  }

  async createOrUpdateCrawlerConfig(insertConfig: InsertCrawlerConfig): Promise<CrawlerConfig> {
    const existing = await this.getCrawlerConfig();
    
    if (existing) {
      const [updated] = await db
        .update(crawlerConfigs)
        .set(insertConfig)
        .where(eq(crawlerConfigs.id, existing.id))
        .returning();
      return updated;
    }

    const [config] = await db
      .insert(crawlerConfigs)
      .values(insertConfig)
      .returning();
    return config;
  }

  async getStats(): Promise<any> {
    const [conversationCount] = await db.select({ count: count() }).from(conversations);
    const [documentCount] = await db.select({ count: count() }).from(documents);
    const [chatbotCount] = await db.select({ count: count() }).from(chatbots);
    const [messageCount] = await db.select({ count: count() }).from(messages);

    const recentConversations = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt))
      .limit(5);

    return {
      conversations: conversationCount.count,
      documents: documentCount.count,
      chatbots: chatbotCount.count,
      interactions: messageCount.count,
      recentConversations,
    };
  }

  async getAnalytics(): Promise<any> {
    const allConversations = await db.select().from(conversations);
    
    // Calculate active sessions (conversations with messages in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMessages = await db
      .select({ conversationId: messages.conversationId })
      .from(messages)
      .where(gt(messages.createdAt, oneHourAgo))
      .groupBy(messages.conversationId);
    const activeSessions = recentMessages.length;

    // Calculate average response time
    const allMessages = await db
      .select()
      .from(messages)
      .orderBy(messages.conversationId, messages.createdAt);
    
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (let i = 1; i < allMessages.length; i++) {
      const prev = allMessages[i - 1];
      const curr = allMessages[i];
      
      // If prev is user and curr is assistant in same conversation
      if (
        prev.conversationId === curr.conversationId &&
        prev.role === "user" &&
        curr.role === "assistant"
      ) {
        const timeDiff = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
        totalResponseTime += timeDiff;
        responseCount++;
      }
    }
    
    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

    // Calculate top topics from message content
    const topicMap = new Map<string, number>();
    const commonWords = new Set(["the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in", "with", "to", "for", "of", "as", "by", "i", "you", "me", "my", "we", "our", "can", "could", "would", "should", "what", "how", "why", "when", "where", "who", "please", "thanks", "thank", "hello", "hi", "hey"]);
    
    allMessages.forEach((msg) => {
      if (msg.role === "user") {
        // Extract words from user messages
        const words = msg.content.toLowerCase().match(/\b\w+\b/g) || [];
        words.forEach((word) => {
          if (word.length > 3 && !commonWords.has(word)) {
            topicMap.set(word, (topicMap.get(word) || 0) + 1);
          }
        });
      }
    });

    const topTopics = Array.from(topicMap.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate country statistics
    const countryMap = new Map<string, number>();
    allConversations.forEach((conv) => {
      if (conv.visitorCountry) {
        countryMap.set(conv.visitorCountry, (countryMap.get(conv.visitorCountry) || 0) + 1);
      }
    });

    const topCountries = Array.from(countryMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: allConversations.length > 0 ? Math.round((count / allConversations.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Collect visitor locations with coordinates for map
    const visitorLocations = allConversations
      .filter((conv) => conv.visitorLat && conv.visitorLon)
      .map((conv) => ({
        lat: parseFloat(conv.visitorLat!),
        lon: parseFloat(conv.visitorLon!),
        country: conv.visitorCountry,
        city: conv.visitorCity,
      }));

    return {
      totalVisitors: allConversations.length,
      activeSessions,
      countriesCount: countryMap.size,
      avgResponseTime,
      topCountries,
      topTopics,
      visitorLocations,
    };
  }
}

export const storage = new DatabaseStorage();
