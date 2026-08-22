# Floza Lib

Server-side logic and utilities (docs/03_TECH_ARCHITECTURE.MD).

| Folder      | Purpose                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| `utils/`    | Shared helpers (e.g. `cn`)                                              |
| `ai/`       | Chatbot — `index.ts` OpenAI-compatible provider client, `knowledge.ts` system prompt, `scripted.ts` fallback |
| `database/` | Storage layer for leads + conversations — Neon when `DATABASE_URL` is set, in-memory fallback otherwise |
| `email/`    | Lead notifications via SMTP (`nodemailer`) with console fallback        |
| `auth.ts`   | Admin session auth — HMAC-signed HttpOnly cookie against `ADMIN_SECRET` |
| `rate-limit.ts` | In-memory sliding-window rate limiting for the API routes            |
| `seo.ts`    | Site URL resolution (`NEXT_PUBLIC_SITE_URL` → Vercel URL → fallback) + `buildMetadata` helper used by every public page |

## Environment

See `.env.example`. Everything degrades gracefully:

- **Database**: no `DATABASE_URL` → in-memory store (resets on restart; production
  should always set it).
- **Email**: no `SMTP_*` → notifications are logged to the console.
- **AI**: no `AI_API_KEY` → the chatbot uses the scripted knowledge base.
- **Admin**: no `ADMIN_SECRET` → `/admin` is disabled and the login page explains why.

## Rules

- Never import server-only modules (`database/`, `email/`, `ai/index.ts`,
  `ai/knowledge.ts`) into Client Components — secrets must stay on the server
  (docs/09_SECURITY_AND_PRIVACY.MD).
- `ai/scripted.ts` is the exception: pure functions, safe for client fallbacks.
- Swapping providers (database or AI) only changes env vars and the adapter file —
  the rest of the app stays the same (docs/10_DEPLOYMENT_PLAN.MD).
