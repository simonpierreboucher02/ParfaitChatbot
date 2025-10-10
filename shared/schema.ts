import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies table - stores business information
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  website: text("website"),
  industry: text("industry"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chatbots table - configuration for each company's chatbot
export const chatbots = pgTable("chatbots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  personality: text("personality").default("professional"),
  language: text("language").default("en"),
  primaryColor: text("primary_color").default("#8b5cf6"),
  position: text("position").default("right"), // left or right
  llmModel: text("llm_model").default("openai/gpt-5"),
  temperature: text("temperature").default("0.7"),
  systemPrompt: text("system_prompt"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Documents table - uploaded files and crawled content
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceType: text("source_type").notNull(), // 'upload', 'crawl'
  sourceUrl: text("source_url"),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Embeddings table - vector embeddings for RAG
export const embeddings = pgTable("embeddings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  chunkText: text("chunk_text").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: text("embedding").notNull(), // JSON string of vector
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Conversations table - chat sessions
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatbotId: varchar("chatbot_id").notNull().references(() => chatbots.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  visitorIp: text("visitor_ip"),
  visitorCountry: text("visitor_country"),
  visitorCity: text("visitor_city"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages table - individual messages in conversations
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  citations: jsonb("citations"), // Array of source references
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Crawler configs table - website crawling settings
export const crawlerConfigs = pgTable("crawler_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  crawlerType: text("crawler_type").notNull(), // 'internal' or 'exa'
  status: text("status").default("pending"), // 'pending', 'running', 'completed', 'failed'
  pagesProcessed: integer("pages_processed").default(0),
  lastCrawledAt: timestamp("last_crawled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  chatbots: many(chatbots),
  documents: many(documents),
  crawlerConfigs: many(crawlerConfigs),
}));

export const chatbotsRelations = relations(chatbots, ({ one, many }) => ({
  company: one(companies, {
    fields: [chatbots.companyId],
    references: [companies.id],
  }),
  conversations: many(conversations),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  company: one(companies, {
    fields: [documents.companyId],
    references: [companies.id],
  }),
  embeddings: many(embeddings),
}));

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  document: one(documents, {
    fields: [embeddings.documentId],
    references: [documents.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  chatbot: one(chatbots, {
    fields: [conversations.chatbotId],
    references: [chatbots.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const crawlerConfigsRelations = relations(crawlerConfigs, ({ one }) => ({
  company: one(companies, {
    fields: [crawlerConfigs.companyId],
    references: [companies.id],
  }),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertChatbotSchema = createInsertSchema(chatbots).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertEmbeddingSchema = createInsertSchema(embeddings).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertCrawlerConfigSchema = createInsertSchema(crawlerConfigs).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export type InsertChatbot = z.infer<typeof insertChatbotSchema>;
export type Chatbot = typeof chatbots.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertEmbedding = z.infer<typeof insertEmbeddingSchema>;
export type Embedding = typeof embeddings.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertCrawlerConfig = z.infer<typeof insertCrawlerConfigSchema>;
export type CrawlerConfig = typeof crawlerConfigs.$inferSelect;
