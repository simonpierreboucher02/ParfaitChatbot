// Referenced from javascript_database blueprint
import {
  companies,
  chatbots,
  documents,
  embeddings,
  conversations,
  messages,
  crawlerConfigs,
  users,
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
  type User,
  type InsertUser,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, count, gt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Company operations (now filtered by userId)
  getCompany(userId: string): Promise<Company | undefined>;
  createOrUpdateCompany(company: InsertCompany): Promise<Company>;

  // Chatbot operations (filtered by userId via company)
  getChatbot(userId: string): Promise<Chatbot | undefined>;
  createOrUpdateChatbot(chatbot: InsertChatbot): Promise<Chatbot>;

  // Document operations (filtered by userId via company)
  getDocuments(userId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string, userId: string): Promise<void>;

  // Embedding operations
  createEmbedding(embedding: InsertEmbedding): Promise<Embedding>;
  searchEmbeddings(queryEmbedding: number[], limit?: number): Promise<Array<Embedding & { document: Document }>>;

  // Conversation operations (filtered by userId via chatbot)
  getConversations(userId: string): Promise<Array<Conversation & { messageCount: number }>>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  // Message operations
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Crawler operations (filtered by userId via company)
  getCrawlerConfig(userId: string): Promise<CrawlerConfig | undefined>;
  createOrUpdateCrawlerConfig(config: InsertCrawlerConfig): Promise<CrawlerConfig>;

  // Stats (filtered by userId)
  getStats(userId: string): Promise<any>;
  getAnalytics(userId: string): Promise<any>;
  
  // Public chatbot access (by slug)
  getChatbotBySlug(slug: string): Promise<(Chatbot & { company: Company }) | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Company operations (filtered by userId)
  async getCompany(userId: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId)).limit(1);
    return company || undefined;
  }

  async createOrUpdateCompany(insertCompany: InsertCompany): Promise<Company> {
    const existing = await this.getCompany(insertCompany.userId);
    
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

  // Chatbot operations (filtered by userId via company)
  async getChatbot(userId: string): Promise<Chatbot | undefined> {
    const company = await this.getCompany(userId);
    if (!company) return undefined;
    
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.companyId, company.id)).limit(1);
    return chatbot || undefined;
  }

  async createOrUpdateChatbot(insertChatbot: InsertChatbot): Promise<Chatbot> {
    const company = await db.select().from(companies).where(eq(companies.id, insertChatbot.companyId)).limit(1);
    if (!company.length) {
      throw new Error("Company must be created first");
    }
    
    const existing = await db.select().from(chatbots).where(eq(chatbots.companyId, insertChatbot.companyId)).limit(1);
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(chatbots)
        .set(insertChatbot)
        .where(eq(chatbots.id, existing[0].id))
        .returning();
      return updated;
    }

    const [chatbot] = await db
      .insert(chatbots)
      .values(insertChatbot)
      .returning();
    return chatbot;
  }

  // Document operations (filtered by userId via company)
  async getDocuments(userId: string): Promise<Document[]> {
    const company = await this.getCompany(userId);
    if (!company) return [];
    
    return await db.select().from(documents).where(eq(documents.companyId, company.id)).orderBy(desc(documents.createdAt));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    const company = await this.getCompany(userId);
    if (!company) throw new Error("Company not found");
    
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Embedding operations
  async createEmbedding(insertEmbedding: InsertEmbedding): Promise<Embedding> {
    const [embedding] = await db
      .insert(embeddings)
      .values(insertEmbedding)
      .returning();
    return embedding;
  }

  async searchEmbeddings(queryEmbedding: number[], limit: number = 5): Promise<Array<Embedding & { document: Document }>> {
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

  // Conversation operations (filtered by userId via chatbot)
  async getConversations(userId: string): Promise<Array<Conversation & { messageCount: number }>> {
    const chatbot = await this.getChatbot(userId);
    if (!chatbot) return [];
    
    const convs = await db
      .select({
        conversation: conversations,
        messageCount: count(messages.id),
      })
      .from(conversations)
      .where(eq(conversations.chatbotId, chatbot.id))
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

  // Message operations
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

  // Crawler operations (filtered by userId via company)
  async getCrawlerConfig(userId: string): Promise<CrawlerConfig | undefined> {
    const company = await this.getCompany(userId);
    if (!company) return undefined;
    
    const [config] = await db.select().from(crawlerConfigs).where(eq(crawlerConfigs.companyId, company.id)).limit(1);
    return config || undefined;
  }

  async createOrUpdateCrawlerConfig(insertConfig: InsertCrawlerConfig): Promise<CrawlerConfig> {
    const existing = await db.select().from(crawlerConfigs).where(eq(crawlerConfigs.companyId, insertConfig.companyId)).limit(1);
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(crawlerConfigs)
        .set(insertConfig)
        .where(eq(crawlerConfigs.id, existing[0].id))
        .returning();
      return updated;
    }

    const [config] = await db
      .insert(crawlerConfigs)
      .values(insertConfig)
      .returning();
    return config;
  }

  // Stats (filtered by userId)
  async getStats(userId: string): Promise<any> {
    const company = await this.getCompany(userId);
    if (!company) {
      return { conversations: 0, documents: 0, chatbots: 0 };
    }
    
    const chatbot = await this.getChatbot(userId);
    
    const [conversationCount] = await db
      .select({ count: count() })
      .from(conversations)
      .where(chatbot ? eq(conversations.chatbotId, chatbot.id) : eq(conversations.chatbotId, ""));
    
    const [documentCount] = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.companyId, company.id));
    
    const chatbotCount = chatbot ? 1 : 0;

    return {
      conversations: Number(conversationCount?.count || 0),
      documents: Number(documentCount?.count || 0),
      chatbots: chatbotCount,
    };
  }

  async getAnalytics(userId: string): Promise<any> {
    const chatbot = await this.getChatbot(userId);
    if (!chatbot) {
      return {
        totalVisitors: 0,
        activeSessions: 0,
        countriesCount: 0,
        avgResponseTime: 0,
        topCountries: [],
        topTopics: [],
        visitorLocations: [],
      };
    }
    
    const allConversations = await db.select().from(conversations).where(eq(conversations.chatbotId, chatbot.id));
    
    // Calculate active sessions (conversations with messages in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMessages = await db
      .select({ conversationId: messages.conversationId })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(gt(messages.createdAt, oneHourAgo))
      .where(eq(conversations.chatbotId, chatbot.id))
      .groupBy(messages.conversationId);
    const activeSessions = recentMessages.length;

    // Calculate average response time
    const allMessages = await db
      .select()
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(eq(conversations.chatbotId, chatbot.id))
      .orderBy(messages.conversationId, messages.createdAt);
    
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (let i = 1; i < allMessages.length; i++) {
      const prev = allMessages[i - 1];
      const curr = allMessages[i];
      
      if (
        prev.messages.conversationId === curr.messages.conversationId &&
        prev.messages.role === "user" &&
        curr.messages.role === "assistant"
      ) {
        const timeDiff = new Date(curr.messages.createdAt).getTime() - new Date(prev.messages.createdAt).getTime();
        totalResponseTime += timeDiff;
        responseCount++;
      }
    }
    
    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

    // Calculate top topics
    const topicMap = new Map<string, number>();
    const commonWords = new Set(["the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in", "with", "to", "for", "of", "as", "by", "i", "you", "me", "my", "we", "our", "can", "could", "would", "should", "what", "how", "why", "when", "where", "who", "please", "thanks", "thank", "hello", "hi", "hey"]);
    
    allMessages.forEach((msg) => {
      if (msg.messages.role === "user") {
        const words = msg.messages.content.toLowerCase().match(/\b\w+\b/g) || [];
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

    // Collect visitor locations
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

  // Public chatbot access (by slug)
  async getChatbotBySlug(slug: string): Promise<(Chatbot & { company: Company }) | undefined> {
    const result = await db
      .select()
      .from(chatbots)
      .innerJoin(companies, eq(chatbots.companyId, companies.id))
      .where(eq(companies.slug, slug))
      .limit(1);

    if (result.length === 0) return undefined;

    return {
      ...result[0].chatbots,
      company: result[0].companies,
    };
  }
}

export const storage = new DatabaseStorage();
