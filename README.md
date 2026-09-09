<p align="center">
  <img src="./public/anthos-banner.png" alt="Anthos Banner" width="100%" />
</p>

# Anthos Web

An intelligent, privacy-first email dashboard and organization companion built with **Next.js**, **React 19**, **Better Auth**, **Drizzle ORM**, and **Tailwind CSS**.

Anthos Web connects respectfully to your Gmail with read-only permissions, safeguarding your correspondence through client-side encryption while providing real-time AI email classification, priority scoring, summarization, and interactive visual analytics.

---

## Table of Contents

1. [Overview & Philosophy](#overview--philosophy)
2. [Key Features](#key-features)
3. [Architecture & Workflow](#architecture--workflow)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Environment Configuration](#environment-configuration)
7. [Installation & Setup](#installation--setup)
8. [Running the Application](#running-the-application)
9. [AI Integration & Real-Time Streaming](#ai-integration--real-time-streaming)
10. [Security & Privacy Commitments](#security--privacy-commitments)
11. [Companion CLI Integration](#companion-cli-integration)
12. [License & Acknowledgments](#license--acknowledgments)

---

## Overview & Philosophy

Anthos Web was designed to bring clarity, calm, and intelligence to email management without compromising personal privacy.

- **Strict Respect for Privacy**: Your inbox represents your personal space. Anthos Web requests only read-only permissions (`gmail.readonly`). It never modifies, deletes, or sends emails on your behalf.
- **Client-Side Safeguards**: Fetched emails are encrypted directly within your browser using modern Web Crypto standards. Your sensitive content remains your own.
- **Purposeful AI Assistance**: Rather than scanning an entire mailbox continuously in the background, Anthos Web analyzes focused batches (up to 5 emails at a time) on demand. You remain in complete control of which messages are processed.
- **Calm, Motion-First Interface**: Built with fluid spring physics and thoughtful micro-interactions, Anthos delivers immediate feedback without visual clutter.

---

## Key Features

- **Selective Mail Fetching**: Query Gmail with flexible parameters including read/unread status, lookback days, quantity limits, and important or starred flags.
- **Real-Time Streaming Drawer**: Watch the AI pipeline work in real time through an integrated sliding terminal drawer, displaying live progress logs, categorization stages, and verification checks streamed directly over WebSockets.
- **Intelligent Classification & Summaries**: Automatically tags emails into user-defined or default categories, synthesizes clear 50-word summaries, and calculates confidence scores (0–100%).
- **Dual-Metric Priority Visualization**: An interactive scatter plot charting email priority alongside classification confidence, complete with 4-tier quadrant filtering and category breakdowns.
- **Single-Mail Insights**: Deep-dive into individual emails on demand to generate instant key takeaways and action points.
- **Encrypted Local Vault**: Encrypts and caches emails locally in the browser with AES-GCM encryption, keeping data accessible across visits while staying protected.
- **Optional Cloud Vault**: Persist analyzed records securely in a PostgreSQL database using server-side AES-256-GCM encryption for unified cross-device access.

---

## Architecture & Workflow

Anthos Web acts as the intuitive visual client within the Anthos open-source ecosystem, interfacing seamlessly with Google's Gmail API, the Anthos AI backend, and persistent database storage:

```
                      [ Google Gmail API ]
                                │
                  (OAuth 2.0 — Read-Only Scope)
                                │
                                ▼
                       [ Anthos Web UI ]
             (Next.js App Router · React 19 · Framer Motion)
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
[ Local Vault ]        [ WebSocket Stream ]      [ Cloud Vault ]
  (IndexedDB)           (ws://.../analyse)         (PostgreSQL)
  Client AES-GCM                │                Server AES-256-GCM
                                ▼
                       [ Anthos AI Server ]
                    (LangGraph Multi-Agent)
                                │
                   Live Progress & Status Logs
                                │
                                ▼
                    [ Interactive Dashboard ]
                 (Priority Graph · Categorized)
```

### Workflow Highlights:
1. **Authentication**: Users sign in securely through Google OAuth managed by Better Auth.
2. **Retrieve**: Desired emails are fetched on demand directly from Gmail via the official Google APIs.
3. **Analyze**: When analysis is requested, the payload is transmitted to the Anthos AI server via a persistent WebSocket connection.
4. **Stream & Display**: Real-time pipeline events stream directly to the progress drawer, after which the dashboard updates automatically with priority scores and summaries.
5. **Vault**: Users can optionally sync analyzed records to their encrypted database vault for historical tracking.

---

## Project Structure

```text
anthos.web/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Authentication entry points
│   │   ├── actions.ts          # Type-safe server actions (Fetch, Analyze, Insights)
│   │   ├── api/                # Better Auth and background API route handlers
│   │   └── db/                 # Drizzle ORM schema definitions and database connection
│   ├── components/
│   │   ├── ui/                 # Reusable accessible interface primitives
│   │   ├── Header.tsx          # Dynamic navigation bar with active progress indicator
│   │   ├── Analyze.tsx         # Primary inbox coordinator and view controller
│   │   ├── MailTable.tsx       # Responsive table with batch selection and quick actions
│   │   ├── AnalysisProgressDrawer.tsx # Live streaming terminal drawer for AI updates
│   │   ├── AnalyzedMailsPriorityGraph.tsx # Priority and confidence visual analytics
│   │   ├── MailSheet.tsx       # Detail slide-over view for comprehensive mail inspection
│   │   ├── FetchDialog.tsx     # Gmail fetch configuration modal
│   │   ├── AnalyzeDialog.tsx   # Model selection and analysis confirmation modal
│   │   └── InsightDialog.tsx   # Single-mail quick insight dialog
│   ├── lib/                    # Encryption engines, auth configuration, and utilities
│   └── types/                  # Shared TypeScript interfaces and domain schemas
├── public/                     # Static media and brand assets
├── drizzle.config.ts           # Drizzle Kit migration configuration
├── package.json                # Project dependencies and script definitions
└── README.md                   # Project documentation
```

---

## Prerequisites

Before running Anthos Web locally, ensure you have:

- **Node.js**: Version 20 or higher, or [Bun](https://bun.sh)
- **Google Cloud Console Credentials**: An OAuth 2.0 Client ID with the `https://www.googleapis.com/auth/gmail.readonly` scope enabled
- **PostgreSQL Database**: A running instance (such as [Neon](https://neon.tech), Supabase, or a local database)
- **Anthos AI Server** *(Optional but recommended)*: The companion Python backend running on `http://localhost:8000` for full real-time classification

---

## Environment Configuration

Create a `.env.local` file in the project root based on the configuration below:

```env
# Application Base URL
BETTER_AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# Authentication Security Secret (Minimum 32 random characters)
BETTER_AUTH_SECRET="your-secure-random-secret"
AUTH_SECRET="your-secure-random-secret"

# PostgreSQL Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/anthos"

# Google Cloud OAuth 2.0 Credentials
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Server-Side Vault Encryption (32-byte hex string for AES-256-GCM)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Anthos AI Backend URL
AI_SERVER_URL="http://localhost:8000"
NEXT_PUBLIC_AI_SERVER_URL="http://localhost:8000"

# Optional Administrator Email
ADMIN_EMAIL="admin@example.com"
```

> **Google OAuth Configuration Tip**: Ensure your Google Cloud Console Authorized Redirect URI includes:  
> `http://localhost:3000/api/auth/callback/google`

---

## Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/anthos.web.git
cd anthos.web

# 2. Install dependencies (Bun recommended)
bun install

# 3. Synchronize database schema
bun run db:push
```

If you prefer using `npm` or `pnpm`:
```bash
npm install
npm run db:push
```

---

## Running the Application

### Development Mode

Start the Next.js development server:

```bash
bun dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

### Production Build

To validate type integrity and build for production:

```bash
bun run build
bun start
```

### Database Management

Anthos Web uses Drizzle ORM for schema management. You can launch Drizzle Studio to inspect and edit records directly in your browser:

```bash
bun run db:studio
```

---

## AI Integration & Real-Time Streaming

Anthos Web interfaces with the **Anthos AI Server** over a bidirectional WebSocket:

1. **Connection**: When analysis begins, Anthos Web establishes a WebSocket connection to `ws://localhost:8000/analyse`.
2. **Payload**: The selected emails, user categories, and model configurations are sent in structured JSON.
3. **Live Progress**: The server streams back log events as they occur—including text cleaning, regex fast-routing, LLM evaluation, and supervisor verification.
4. **Visual Feedback**: The streaming drawer opens to present color-coded operational badges and diagnostic logs.
5. **Completion**: When analysis concludes, the drawer closes automatically, results are recorded, and the interactive priority graph is populated.
6. **Resilient Fallback**: If WebSocket streaming is unavailable, Anthos Web automatically falls back to standard HTTP `POST /analyse` to ensure uninterrupted service.

---

## Security & Privacy Commitments

Anthos Web is engineered with trust and data dignity at its foundation:

- **Read-Only Guarantee**: OAuth scopes are intentionally limited to `gmail.readonly`. The application cannot alter, delete, send, or draft messages.
- **Client-Side Zero-Knowledge**: Email content stored on the client is encrypted with keys derived from your authenticated session, ensuring your data remains private.
- **No Third-Party Tracking**: Your emails are never retained for marketing purposes, sold, or shared with unauthorized third parties.
- **Bounded Requests**: Email batches are strictly capped at 5 messages per analysis request to prevent unintended bulk exposure.

---

## Companion CLI Integration

Anthos Web works in harmony with **`anthos.cli`**, the terminal companion for command-line power users:

- **Unified Authentication**: Both the web application and CLI share Better Auth verification and database tables.
- **Centralized Vault**: Emails analyzed through the CLI can be stored into the shared PostgreSQL vault and viewed immediately on the web dashboard.
- **Synchronized Categories**: Categories defined in the web interface are shared across CLI sessions for consistent prioritization.

---

## License & Acknowledgments

Anthos Web is open-source software licensed under the **[MIT License](LICENSE)**.

Designed and developed with care by the Anthos contributors. Built using open-source libraries from the Next.js, React, Tailwind CSS, and Drizzle communities.
