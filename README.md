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
9. [Admin Root Portal](#admin-root-portal)
10. [AI Integration & Real-Time Streaming](#ai-integration--real-time-streaming)
11. [Security & Privacy Commitments](#security--privacy-commitments)
12. [Companion CLI Integration](#companion-cli-integration)
13. [License & Acknowledgments](#license--acknowledgments)

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
- **Admin Root Portal**: A password-protected backdoor at `/root` for administrators to inspect sample data, test fetch/load workflows, and analyze emails without requiring OAuth sign-in.

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

### Workflow Highlights

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
│   │   ├── (app)/              # Authenticated app routes (analyze, admin, settings, etc.)
│   │   ├── root/               # Admin backdoor route (/root) — password protected
│   │   │   └── page.tsx        # Root backdoor login & sample Analyze workspace
│   │   ├── api/
│   │   │   ├── admin/verify/   # POST endpoint for admin password verification
│   │   │   ├── mail/           # Mail fetch, load, sync, analyze, insight APIs
│   │   │   ├── category/       # Category CRUD APIs
│   │   │   └── auth/           # Better Auth handler routes
│   │   ├── actions.ts          # Type-safe server actions (Fetch, Analyze, Insights)
│   │   └── db/                 # Drizzle ORM schema definitions and database connection
│   ├── components/
│   │   ├── ui/                 # Reusable accessible interface primitives
│   │   ├── RootLogin.tsx       # Split-screen admin login (password + Unsplash image)
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
├── env.sample                  # Environment variable template
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

Create a `.env` file in the project root. Refer to [`env.sample`](./env.sample) for the full list of variables:

| Variable | Description | Required |
|---|---|---|
| `BETTER_AUTH_URL` | Application base URL (e.g., `http://localhost:3000`) | ✅ |
| `BETTER_AUTH_SECRET` | Authentication security secret (min 32 random chars) | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `AUTH_GOOGLE_ID` | Google Cloud OAuth 2.0 Client ID | ✅ |
| `AUTH_GOOGLE_SECRET` | Google Cloud OAuth 2.0 Client Secret | ✅ |
| `AI_SERVER_URL` | Anthos AI backend URL (e.g., `http://localhost:8000`) | ✅ |
| `ADMIN_EMAIL` | Administrator email for the `/admin` route | Optional |
| `ADMIN_PASSWORD` | Administrator password for the `/root` backdoor portal | Optional |
| `AUTH_SECRET` | Additional auth secret | Optional |
| `BETTER_AUTH_API_KEY` | Better Auth API key | Optional |
| `GROQ_API_KEY` | Groq API key for LLM provider support | Optional |

### Example `.env`

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-admin-password"
AI_SERVER_URL="http://localhost:8000"
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_SECRET="your-auth-secret"
BETTER_AUTH_API_KEY="your-better-auth-api-key"
BETTER_AUTH_SECRET="your-secure-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
GROQ_API_KEY="your-groq-api-key"
DATABASE_URL="postgresql://user:password@localhost:5432/anthos"
```

> **Google OAuth Redirect URI**: Ensure your Google Cloud Console Authorized Redirect URI includes:
> `http://localhost:3000/api/auth/callback/google`

---

## Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/anthos.web.git
cd anthos.web

# 2. Install dependencies (Bun recommended)
bun install

# 3. Copy env template and configure
cp env.sample .env
# Edit .env with your actual values

# 4. Synchronize database schema
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

## Admin Root Portal

Anthos provides a hidden administrator backdoor at **`/root`** for quick access and testing without requiring Google OAuth sign-in. Once authenticated, the root user is treated as a normal user with access to the full **Analyze** interface, populated with mock datasets for both cloud fetch and database load without contacting backend services or databases.

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    /root Route                          │
│                                                         │
│  ┌──────────────────┐    ┌────────────────────────────┐ │
│  │   Left Panel     │    │     Right Panel            │ │
│  │                  │    │                            │ │
│  │  🔒 Password     │    │  🌿 Unsplash Nature Image  │ │
│  │     Input        │    │     (priority loaded)      │ │
│  │                  │    │                            │ │
│  │  [Authenticate]  │    │                            │ │
│  │  (ADMIN_PASSWORD)│    │                            │ │
│  └──────────────────┘    └────────────────────────────┘ │
│                                                         │
│              ▼ On Successful Verification               │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            Analyze Inbox Workspace                  │ │
│  │                                                     │ │
│  │  [Fetch Mails] (Cloud Simulation — 5 Mock Emails)   │ │
│  │  [Load Data]   (DB Simulation — 4 Scored Emails)    │ │
│  │  [Analyze]     (AI Analysis & Classification)       │ │
│  │  [Store]       (Simulated Encrypted Storage)        │ │
│  │                                                     │ │
│  │  * Zero database queries or external API calls      │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Configuration

1. Set the `ADMIN_PASSWORD` environment variable in your `.env` file:

   ```env
   ADMIN_PASSWORD="your-secure-admin-password"
   ```

2. Navigate to `http://localhost:3000/root`

3. Enter the password to access the Analyze workspace

### Features

| Feature | Description |
|---|---|
| **Password Gate** | Compares input against `ADMIN_PASSWORD` env variable via `/api/admin/verify` |
| **Split-Screen Login** | Left panel with password input, right panel with Unsplash nature image (loaded with `priority`) |
| **Standard Analyze Workspace** | Full access to the production Analyze inbox UI, tables, sheets, and filters |
| **Simulated Fetch** | Loads 5 sample emails simulating a Gmail cloud fetch without backend calls |
| **Simulated Load** | Loads 4 pre-analyzed sample emails simulating encrypted DB load with priority & confidence scores |
| **Isolated Execution** | All fetch, load, and store operations for root users operate purely in-memory with zero DB writes |
| **Session Persistence** | Authentication state is stored in `sessionStorage` (`anthos_root_auth`) — survives refreshes, clears on logout |

### Security Notes

> ⚠️ The `/root` route is an **admin-only backdoor** intended for development and testing. In production:
> - Use a strong, unique `ADMIN_PASSWORD`
> - Consider adding rate limiting to `/api/admin/verify`
> - Authentication is session-scoped (not persisted across browser sessions)

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
