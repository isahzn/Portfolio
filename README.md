# Floza Website

Floza is an AI automation and software solutions company. This repository contains the
company website: a professional portfolio, interactive workflow demos, and a lead
generation system with a private admin dashboard.

Built with **Next.js** (App Router), **TypeScript**, and **Tailwind CSS**. Designed to
run on **Vercel** first, with a clean path to a future **VPS** migration (no platform
lock-in).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
# open http://localhost:3000
```

The app runs fine without `.env.local` — the lead system falls back to an in-memory
store and email/AI use safe fallbacks — so you can start developing immediately.

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the development server         |
| `npm run build`    | Production build                     |
| `npm run start`    | Serve the production build           |
| `npm run lint`     | Run ESLint                           |

## Project structure

```
app/            Routes and layouts (App Router) — public site in app/(site)/, admin in app/admin/
components/     Reusable component system (ui, layout, sections, projects, demos, chatbot, dashboard, admin)
data/           Static content — projects.json, demos.json, services.json, site.json
lib/            Server-side logic (seo, auth, ai, database, email, rate-limit)
public/         Static assets (icons, images, screenshots, projects)
docs/           Planning documents
```

Content lives in `data/` and is separated from code, so adding a project, demo, or
service never requires touching components.

## Environment variables

Copy `.env.example` to `.env.local` (local) or add to Vercel (production). All values
are server-side; never commit real secrets (`.env*` is gitignored).

| Variable                  | Purpose                                        |
| ------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`    | Canonical origin — SEO, sitemap, share images  |
| `DATABASE_URL`            | Neon Postgres connection string (leads + chats)|
| `AWS_ENDPOINT_URL_S3`     | S3-compatible storage endpoint (reserved)      |
| `AWS_ACCESS_KEY_ID`       | Storage access key (reserved)                  |
| `AWS_SECRET_ACCESS_KEY`   | Storage secret key (reserved)                  |
| `AWS_REGION`              | Storage region (reserved)                      |
| `SMTP_HOST` / `SMTP_PORT` | Email notifications (e.g. smtp.gmail.com:587)  |
| `SMTP_USER` / `SMTP_PASS` | SMTP login + app password                      |
| `SMTP_FROM` / `SMTP_TO`   | Notification sender / recipient                |
| `AI_API_KEY`              | OpenAI-compatible key (chatbot)                |
| `AI_BASE_URL` / `AI_MODEL`| Provider endpoint and model                    |
| `ADMIN_SECRET`            | Password for the private `/admin` dashboard    |

## Deployment (Vercel)

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project**, import the GitHub repo (framework auto-detected as Next.js).
3. Add all environment variables from `.env.example` (see table above).
4. Deploy — every push to `main` rebuilds automatically.
5. Optional: set `NEXT_PUBLIC_SITE_URL` to your final domain (e.g. `https://floza.vercel.app`)
   and attach a custom domain in Vercel's Domains settings.

See `docs/10_DEPLOYMENT_PLAN.MD` for the full plan, including the future VPS migration
(only environment variables and deployment config change — the app itself is portable).

## Documentation

All planning documents live in `docs/` (start with `00_PROJECT_OVERVIEW.MD` and
`11_DEPLOYMENT_ROADMAP.MD`).
