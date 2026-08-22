```md id="u7p2kf"
# Floza Deployment Plan

## 1. Purpose

This document defines how Floza will be deployed, maintained, and migrated between hosting environments.

The deployment strategy should:

- Start free using Vercel
- Allow easy updates
- Support future VPS migration
- Avoid platform lock-in

---

# 2. Deployment Overview

Initial architecture:

```

Developer

↓

GitHub Repository

↓

Vercel Deployment

↓

Live Floza Website

```

---

Future architecture:

```

GitHub Repository

↓

VPS Server

↓

Next.js Application

↓

Database + Services

↓

Live Floza Website

```

---

# 3. Version Control

Platform:

```

GitHub

```

Purpose:

- Store code
- Track changes
- Manage versions
- Connect with deployment


Repository structure:

```

floza-website

├── app
├── components
├── data
├── lib
├── public
└── docs

```

---

# 4. Development Environment

Local development:

Requirements:

- Node.js
- Code editor
- Git


Run locally:

```

npm install

npm run dev

```

Local website:

```

localhost:3000

```

---

# 5. Vercel Deployment

## Initial Setup

Steps:

1. Push project to GitHub

2. Connect repository to Vercel

3. Select Next.js framework

4. Add environment variables

5. Deploy


---

# 6. Environment Variables

Vercel should store:

Example:

```

AI_API_KEY=

DATABASE_URL=

EMAIL_API_KEY=

AUTH_SECRET=

```

Never store these inside:

- Source code
- GitHub
- Public files

---

# 7. Deployment Workflow

Normal update process:

```

Change code

↓

Test locally

↓

Push to GitHub

↓

Vercel automatically builds

↓

New version goes live

```

---

# 8. Branch Strategy

Recommended:

Main branch:

```

main

```

Purpose:

Production website.


Optional:

```

development

```

Purpose:

Testing new features.

---

# 9. Preview Deployments

Before making changes public:

Create preview deployment.

Flow:

```

New feature

↓

Preview version

↓

Test

↓

Merge to main

↓

Production update

```

---

# 10. Domain Setup

Initial:

Use Vercel domain:

```

floza.vercel.app

```

---

Future:

Custom domain:

Example:

```

floza.com

```

Setup:

```

Domain Provider

↓

DNS Settings

↓

Vercel

↓

Website

```

---

# 11. VPS Migration Strategy

Goal:

Move from Vercel without rewriting the application.

---

The application should already support:

- Next.js server
- Environment variables
- External database
- External storage


---

Migration steps:

## Step 1

Prepare VPS:

Install:

- Node.js
- Git
- Database
- Reverse proxy


---

## Step 2

Clone repository:

```

git clone repository-url

```

---

## Step 3

Install dependencies:

```

npm install

```

---

## Step 4

Add environment variables.

---

## Step 5

Build:

```

npm run build

```

---

## Step 6

Run application:

```

npm start

```

---

# 12. VPS Production Setup

Recommended future tools:

## Process Manager

Example:

```

PM2

```

Purpose:

- Keep application running
- Restart after crashes


---

## Reverse Proxy

Example:

```

Nginx

```

Purpose:

- Handle traffic
- SSL
- Domain routing


---

## SSL

Use:

```

HTTPS

```

Required for:

- Security
- Trust
- APIs

---

# 13. Database Migration

Database should be independent.

Example:

Current:

```

Cloud Database

```

Future:

```

VPS Database

```

The application should only change:

```

DATABASE_URL

```

---

# 14. Storage Migration

Files should not be tightly connected to one provider.

Examples:

Current:

```

Cloud Storage

```

Future:

```

VPS Storage

```

Only storage configuration changes.

---

# 15. Monitoring

Future additions:

Monitor:

- Website uptime
- Errors
- API usage
- Database health

---

# 16. Backup Plan

Important backups:

- Code
- Database
- Project images
- Client data


Backup frequency:

Depends on usage.

For early stages:

Regular manual backups are acceptable.

---

# 17. Deployment Rules

Always:

✓ Test before deploying  
✓ Keep environment variables separate  
✓ Keep backups  
✓ Monitor errors  
✓ Document changes  


Never:

✗ Upload secrets to GitHub  
✗ Make production changes without testing  
✗ Depend on one hosting provider permanently  

---

# 18. Final Deployment Goal

The final Floza system should be:

```

Easy to deploy

Easy to update

Free at the beginning

Ready for growth

Portable between hosting providers

```

The website should work the same whether it runs on:

- Vercel
- VPS
- Future infrastructure
```
