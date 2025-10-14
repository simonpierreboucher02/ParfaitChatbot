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
- Standalone chatbot page accessible via direct URL (/chat)
- Geolocation-aware visitor tracking with private IP detection

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

**Authentication (Public):**
- `/api/register` - User registration with username/password
- `/api/login` - User login (Passport.js local strategy)
- `/api/logout` - User logout
- `/api/user` - Get current authenticated user

**Admin Endpoints (Protected - require authentication):**
- `/api/company` - Company profile management
- `/api/chatbot` - Chatbot configuration
- `/api/documents` - Document management and crawling
- `/api/conversations` - Conversation history
- `/api/analytics` - Usage statistics

**Public Endpoints (No authentication required):**
- `/api/chatbot/:slug` - Get chatbot configuration by company slug
- `/api/chat` - Real-time chat with streaming responses
- `/api/openrouter/models` - Fetch 400+ available LLM models (1-hour cache)
- `/widget.js` - Widget JavaScript file

**Frontend Routes:**

**Public Routes:**
- `/auth` - Login/Register page
- `/chat/:slug` - Standalone fullscreen chatbot (accessible via company slug)

**Protected Routes (require authentication):**
- `/` - Dashboard with key metrics
- `/chatbot` - Chatbot configuration
- `/documents` - Knowledge base management
- `/models` - OpenRouter model marketplace
- `/widget` - Embeddable widget code and standalone chatbot URL
- `/conversations` - Chat history with message details
- `/analytics` - Visitor analytics and geographic map
- `/settings` - Company profile and branding

**Authentication & Multi-Tenancy:**
- **Passport.js** with local strategy for username/password authentication
- **Scrypt** password hashing with salt (secure, memory-hard algorithm)
- **Session-based authentication** using PostgreSQL session store
- **Session security**: httpOnly cookies, sameSite=lax, secure in production, 7-day maxAge
- **Multi-tenant data isolation**: All storage methods filter by userId
- **Protected routes**: requireAuth middleware on all admin API endpoints
- **Company slugs**: Auto-generated URL-safe slugs for public chatbot access

**Key Architectural Patterns:**
- Separation of concerns with dedicated modules (routes, storage, crawler, vector store)
- Repository pattern via storage abstraction layer
- Multi-tenant architecture with complete data isolation per user account
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
- Users - Account credentials and authentication (username, hashed password)
- Companies - Business information, branding, and unique slug (linked to userId)
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

**Geolocation:** 
- IP-based visitor tracking using ip-api.com (free tier, 45 requests/minute)
- Private IP detection (10.x.x.x, 172.16-31.x.x, 192.168.x.x) to avoid unnecessary API calls
- Caching system to reduce external API requests
- Geographic map visualization with Leaflet.js showing visitor locations
- Displays "Unknown Location" for private IPs or failed lookups

## Recent Updates (October 2025)

### Multi-Tenant Authentication System (October 14, 2025)
- **Complete Authentication**: Username/password auth with Passport.js and scrypt hashing
  - Registration, login, logout endpoints
  - Session-based authentication with PostgreSQL store
  - Secure cookie configuration (httpOnly, sameSite, 7-day expiry)
  
- **Multi-Tenant Architecture**: Full data isolation per user account
  - Users table with unique username constraint
  - Companies table with userId foreign key and unique slug
  - All storage methods filter by userId (companies, chatbots, documents, etc.)
  - Protected admin routes require authentication
  
- **Slug-Based Public Chatbot URLs**: Companies get unique chatbot URLs
  - Automatic slug generation from company name (e.g., "Acme Corp" → "acme-corp")
  - Public endpoint `/api/chatbot/:slug` (no authentication required)
  - Standalone chat page `/chat/:slug` accessible to anyone
  - Widget page displays personalized chatbot URL
  
- **Frontend Authentication**: Modern auth experience
  - AuthContext with useAuth hook for state management
  - Login/Register page with tabs and violet-themed design
  - ProtectedRoute component redirects unauthenticated users
  - Public routes: `/auth`, `/chat/:slug`
  - Protected routes: All admin pages (dashboard, settings, etc.)

### Standalone Chatbot Feature
- **Fullscreen Chat Page** (`/chat`): Dedicated chatbot interface without admin sidebar/header
  - Accessible via direct URL for sharing or testing
  - Uses chatbot configuration (name, colors, model)
  - Streaming responses with session persistence
  - Opens in popup window (500x700) from widget configuration page
  
- **Widget Page Enhancement**: Added "Standalone Chatbot" section
  - Display and copy chatbot URL
  - "Open Chatbot" button launches popup window
  - URL format: `https://[domain]/chat`

### OpenRouter Model Marketplace
- **Model Browser Page** (`/models`): Browse and test 400+ LLM models
  - Search functionality by model name/ID
  - Filter by provider (OpenAI, Anthropic, Meta, Google, etc.)
  - Filter by price tier (Free, Low, Medium, High)
  - Model details: context length, pricing, modality
  - Live playground for testing models with streaming
  - Copy model ID to clipboard
  - Backend caching (1 hour) to optimize API usage

- **Chatbot Settings Integration**: Dropdown now populated with all 400+ OpenRouter models
  - Previously hardcoded to 6 models
  - Dynamic fetching from `/api/openrouter/models`
  - Real-time model count display

### Bug Fixes
- **Conversations Page**: Fixed empty list issue
  - Problem: Filter only checked country/city (all null), hiding all conversations
  - Solution: Show all conversations when search empty, added search by sessionId/IP
  - Display "Unknown Location" when geolocation unavailable
  
- **Geographic Map**: Fixed empty map issue
  - Problem: Private IPs sent to external API causing failures
  - Solution: Added private IP detection, skip API calls for internal IPs
  - Shows appropriate empty state for private IP deployments

- **Model Playground**: Fixed model override in chat endpoint
  - Problem: Playground always used default chatbot model
  - Solution: Added `model` parameter support in `/api/chat`
  - Verified with E2E testing (Claude model identity confirmation)