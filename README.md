# Anthos Web

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-000?logo=drizzle)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A Next.js dashboard for Gmail: read-only OAuth, encrypted local vault (IndexedDB), optional AES-256-GCM cloud backup in Postgres, AI-assisted mail analysis, and a motion-first UI.

**Live stack:** Next.js App Router · NextAuth (Google) · Gmail API · Drizzle + Postgres (Neon) · Framer Motion · Radix UI · Tailwind CSS v4

---

## Features

| Area | Description |
|------|-------------|
| **Fetch** | Query Gmail with read/unread, lookback days, count, important, and starred filters. |
| **Local vault** | Fetched mail encrypted in the browser (AES-GCM, key derived from user id + email). |
| **Analyze** | Select fetched mail, run AI analysis with options derived from the selection; optional store to DB. |
| **Cloud vault** | Manually sync selected analyzed mail to Postgres (`encrypted_mail`) with server-side encryption. |
| **Tabs** | Separate **Fetched** and **Analyzed** inboxes with search and detail sheet. |

---

## Quick start

### Prerequisites

- Node.js 20+ or [Bun](https://bun.sh)
- Google Cloud OAuth client (Gmail API enabled)
- Postgres database (e.g. [Neon](https://neon.tech))
- Optional: separate [AI server](https://github.com) exposing `POST /analyze/mails`

### Install

```bash
git clone https://github.com/YOUR_ORG/anthos.web.git
cd anthos.web
cp .env.example .env.local
```

Fill in `.env.local` (see [Environment](#environment)), then:

```bash
bun install
bun run db:push
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Auth secret (32+ bytes random base64) |
| `BETTER_AUTH_URL` | Yes | App base URL (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Yes | Google Cloud OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google Cloud OAuth client secret |
| `ENCRYPTION_KEY` | Yes | 32-byte hex for AES-256-GCM cloud vault encryption |
| `ADMIN_EMAIL` | No | Comma-separated admin emails |
| `AI_SERVER_URL` | No | Base URL of the AI processing server |

Google OAuth redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google`  
Scope used: `openid email profile https://www.googleapis.com/auth/gmail.readonly`

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Development server |
| `bun run build` | Production build |
| `bun start` | Start production server |
| `bun run lint` | ESLint |
| `bun run db:generate` | Drizzle migrations (generate) |
| `bun run db:push` | Push schema to database |
| `bun run db:studio` | Drizzle Studio |

---

## Architecture

```text
Browser (Home)
  ├─ Fetch → POST /api/mail/fetch → Gmail API
  ├─ Vault  → IndexedDB (client AES-GCM)
  ├─ Analyze → analyzeMailsAction → POST /api/mail/analyze-check
  │            → AI_SERVER_URL/analyze/mails
  └─ Sync   → POST /api/mail/sync → encrypted_mail (Postgres)

Auth → /api/auth/[...all] (Better Auth + Google)
```

### CLI Integration

The companion CLI project (`anthos.cli`) is fully integrated with this Next.js web application:
- **Shared DB Access**: The CLI's Hono server (`packages/server`) connects directly to the same Postgres database using Drizzle ORM.
- **Better Auth Device Flow**: Authentication is secured through Better Auth's device authorization flow.
- **Gmail Token Resolving**: When running in `ANALYZE` mode, the CLI retrieves and automatically refreshes Google OAuth tokens directly from the shared `account` table, enabling full terminal-based inbox querying and analysis.

### API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/mail/fetch` | POST | Fetch mail from Gmail with query options |
| `/api/mail/analyze-check` | POST | Partition selected mail vs DB; attach categories/priority |
| `/api/mail/sync` | POST | Upsert selected mail ciphertext into `encrypted_mail` |
| `/api/auth/[...all]` | * | Session and OAuth |

### Database schema

- `user` — OAuth user row (id, email, accessToken, createdAt)
- `encrypted_mail` — per-user encrypted JSON payloads, categories, priority (`decimal(10,4)`)

Defined in [`src/app/db/schema.ts`](src/app/db/schema.ts).

---

## Project structure

```text
src/
├── app/
│   ├── actions.ts          # Server actions (fetch, analyze, sync)
│   ├── api/mail/           # Route handlers
│   ├── api/auth/           # Better Auth
│   ├── db/                 # Drizzle schema + client
│   ├── admin/              # Admin gate (ADMIN_EMAIL)
│   ├── privacy-policy/     # Privacy & security
│   ├── terms-condition/    # Terms of use
│   └── help/               # Documentation & guides
├── components/             # UI (Home, tables, dialogs, graph)
├── lib/                    # Gmail, crypto, vault, auth, API client
└── types/                  # Shared TypeScript types
```

---

## Analyze payload

The AI server should accept:

```json
{
  "mails": [/* Mail[] */],
  "options": {
    "unread": true,
    "days": 3,
    "count": 5,
    "important": false,
    "starred": false,
    "store": false
  }
}
```

`options` are derived from the selected mail batch (dates, status, labels, count). Only `store` is chosen in the UI.

---

## Legal pages

- [Privacy & security](/privacy-policy) — `src/app/(app)/privacy-policy/page.tsx`
- [Terms of use](/terms-condition) — `src/app/(app)/terms-condition/page.tsx`
- [Help & Documentation](/help) — `src/app/(app)/help/page.tsx`

---

## Security notes

- Gmail access is **read-only**.
- Local vault encryption uses Web Crypto; keys are derived from session user id + email (data survives sign-out).
- Server vault uses **AES-256-GCM** via [`src/lib/mail-crypto.ts`](src/lib/mail-crypto.ts).
- Never commit `.env` files; use `.env.example` as a template.

---

## Contributing

1. Fork the repository  
2. Create a branch: `git checkout -b feat/your-feature`  
3. Commit and push  
4. Open a pull request  

Run `bun run lint` and `bun run build` before submitting.

---

## Tags

`nextjs` `react` `typescript` `gmail` `email` `oauth` `drizzle` `postgresql` `encryption` `tailwindcss` `framer-motion` `nextauth` `ai` `dashboard`

---

## License

[MIT](LICENSE) © Anthos contributors
