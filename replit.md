# AgentiLab ChatBuilder - AI-Powered Chatbot Platform

## Overview

AgentiLab ChatBuilder is a SaaS platform that enables businesses to create, deploy, and monitor intelligent AI chatbots powered by their own content. The platform uses RAG (Retrieval-Augmented Generation) technology to train chatbots on website content and documents, providing personalized conversational experiences.

Key capabilities:
- Create AI chatbots trained on company knowledge bases
- Support for 400+ LLM models via OpenRouter (including GPT-5, Claude, Gemini, Llama)
- Website crawling and document processing with OpenAI embeddings
- Real-time chat with streaming responses
- Conversation history and analytics tracking
- Embeddable widget for any website
- Geolocation-aware visitor tracking

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool

**UI System:** Hybrid approach combining shadcn/ui components with custom dark-first design
- Based on Radix UI primitives for accessibility
- Tailwind CSS for styling with custom color system
- Design philosophy: "Legendary but Functional" with violet-spectrum branding
- Mobile-first responsive design with glassmorphic effects

**State Management:**
- TanStack Query (React Query) for server state
- React Hook Form with Zod validation for form management
- Wouter for client-side routing (lightweight alternative to React Router)

**Key Design Decisions:**
- Dark mode as primary theme with near-black backgrounds (0 0% 3%)
- Violet primary color (#8b5cf6) for brand identity
- Custom CSS variables for theming flexibility
- Inter font family for UI, JetBrains Mono for code elements

### Backend Architecture

**Runtime:** Node.js with Express.js server

**Language:** TypeScript with ES modules

**API Design:** RESTful endpoints with streaming support for chat responses
- `/api/company` - Company profile management
- `/api/chatbot` - Chatbot configuration
- `/api/documents` - Document management and crawling
- `/api/chat` - Real-time chat with streaming
- `/api/conversations` - Conversation history
- `/api/analytics` - Usage statistics

**Key Architectural Patterns:**
- Separation of concerns with dedicated modules (routes, storage, crawler, vector store)
- Repository pattern via storage abstraction layer
- Streaming responses for real-time chat experience
- Async generators for efficient data streaming

### Data Storage Solutions

**Primary Database:** PostgreSQL via Neon (serverless)
- Drizzle ORM for type-safe database operations
- Schema-first approach with TypeScript types
- WebSocket-based connection pooling for serverless environment

**Vector Storage:** Hybrid approach
- Database storage for embeddings with JSON array type
- In-memory vector store (vectorStore.ts) for fast similarity search
- File-based persistence (data/vectors.json) for vector cache

**Data Models:**
- Companies - Business information and branding
- Chatbots - AI agent configuration (personality, LLM model, temperature)
- Documents - Knowledge base content from uploads/crawls
- Embeddings - Vector representations for RAG retrieval
- Conversations - Session tracking with geolocation
- Messages - Chat history with role-based structure
- CrawlerConfigs - Website crawling settings

**RAG Pipeline:**
1. Content ingestion via crawling or file upload
2. Text chunking (500 words per chunk)
3. Embedding generation using OpenAI text-embedding-3-large
4. Vector storage with metadata linking
5. Similarity search during chat for context retrieval
6. Context injection into LLM prompts

### External Dependencies

**AI/ML Services:**
- **OpenAI API** - Text embeddings (text-embedding-3-large model)
- **OpenRouter API** - LLM inference with 400+ model support (GPT-5, Claude 3.5, Gemini Pro, Llama 3.1, etc.)
  - Streaming chat completions
  - Configurable temperature and model selection

**Database:**
- **Neon PostgreSQL** - Serverless Postgres database
  - WebSocket-based connections (@neondatabase/serverless)
  - Drizzle ORM integration

**Web Scraping:**
- **Axios** - HTTP client for web requests
- **Cheerio** - HTML parsing and content extraction
- **Custom crawler** - Recursive website crawling with depth limits

**File Handling:**
- **Multer** - Multipart form data and file uploads
- **Uppy** - File upload UI components (@uppy/core, @uppy/dashboard, @uppy/aws-s3, @uppy/react)

**Development Tools:**
- **Vite** - Frontend build tool and dev server
- **Replit plugins** - Development banners, error overlays, cartographer
- **TypeScript** - Type safety across full stack
- **ESBuild** - Server-side bundling for production

**Geolocation:** Visitor tracking system (implementation in conversations tracking)

**Authentication Note:** Design documents reference Clerk authentication with Google/Apple/Email providers, but implementation is not present in current codebase. This is a planned feature.