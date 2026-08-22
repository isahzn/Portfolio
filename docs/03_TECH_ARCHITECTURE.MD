```md
# Floza Technical Architecture

## 1. Purpose

This document defines the technical structure of the Floza website.

The architecture must:

- Be free or low cost initially
- Run on Vercel
- Be portable to a VPS later
- Be easy to maintain
- Support future expansion
- Avoid unnecessary complexity

---

# 2. Core Technology Stack

## Frontend

Framework:

```

Next.js

```

Purpose:

- Build the website
- Create pages
- Handle routing
- Generate fast pages


Language:

```

TypeScript

```

Purpose:

- Better reliability
- Easier maintenance
- Better AI coding assistance


Styling:

```

Tailwind CSS

```

Purpose:

- Fast UI development
- Consistent design
- Responsive layouts


Animations:

```

Framer Motion

```

Purpose:

- Smooth transitions
- Hover effects
- Page animations

---

# 3. Hosting Architecture

## Phase 1: Vercel

Deployment:

```

GitHub Repository
↓
Vercel Build
↓
Live Website

```

Vercel handles:

- Hosting
- Deployments
- HTTPS
- CDN

---

## Phase 2: VPS Migration

Future deployment:

```

VPS Server

Next.js Application
+
Database
+
Storage
+
Background Services

```

The codebase should remain mostly unchanged.

Only changes:

- Environment variables
- Deployment configuration
- Domain settings

---

# 4. Application Structure

Main architecture:

```

Frontend
|
|
API Layer
|
|
Services
|
|
Database / External APIs

```

---

# 5. Folder Structure

Recommended:

```

floza-website/

app/
│
├── page.tsx
├── layout.tsx
│
├── services/
│
├── demos/
│   ├── ai-assistant/
│   ├── document-processing/
│   └── lead-crm/
│
├── projects/
│   ├── page.tsx
│   └── [slug]/
│
├── contact/
│
├── admin/
│
└── api/

components/
│
├── navigation/
├── sections/
├── cards/
├── demos/
├── chatbot/
├── dashboard/
└── ui/

data/
│
├── projects.json
├── demos.json
└── services.json

lib/
│
├── ai/
├── database/
├── email/
├── auth/
└── utils/

public/
│
├── images/
├── screenshots/
└── icons/

docs/
│
└── planning files

```

---

# 6. Page Architecture

## Public Pages

## Homepage

Route:

```

/

```

Contains:

- Hero
- Services preview
- Demo preview
- Project preview
- Contact CTA


---

## Services

Route:

```

/services

```

Contains:

- Automation services
- Website services
- Software solutions


---

## Demos

Route:

```

/demos

```

Contains:

Demo cards:

- AI Assistant
- Document Processing
- Lead CRM


Individual demos:

```

/demos/ai-assistant

/demos/document-processing

/demos/lead-crm

```

---

## Projects

Route:

```

/projects

```

Contains:

- Project cards
- Categories
- Search/filter later


---

## Case Studies

Dynamic route:

```

/projects/[slug]

```

Example:

```

/projects/invoice-automation

```

---

## Contact

Route:

```

/contact

```

Contains:

- Contact form
- Email
- WhatsApp
- Booking link

---

# 7. Component System

The website uses reusable components.

Examples:

## Navbar Component

Used:

- Homepage
- Services
- Projects
- Demos


---

## Project Card Component

Receives:

```

title
image
description
category
link

```

Used:

- Projects page
- Homepage


---

## Demo Card Component

Receives:

```

name
description
image
route

```

Used:

- Demo sections


---

## Button Component

Reusable everywhere.

Types:

- Primary
- Secondary
- Ghost

---

# 8. Data Architecture

Changing content should not require changing code.

Example:

Projects:

```

data/projects.json

```

Contains:

```

title
description
image
category
slug
case study content

```

---

Demos:

```

data/demos.json

```

Contains:

```

name
description
features
route

```

---

Services:

```

data/services.json

```

Contains:

```

service name
description
features

```

---

# 9. AI Architecture

## Chatbot System

Flow:

```

User
↓
Chat UI
↓
API Route
↓
AI Provider
↓
Response

```

The AI key should never be exposed in the browser.

---

Environment variable:

```

AI_API_KEY=

```

---

# 10. Lead System Architecture

Flow:

```

Visitor
↓
Chatbot/Form
↓
API Route
↓
Lead Storage
↓
Email Notification
↓
Admin Dashboard

```

---

# 11. Database Strategy

Initial version:

Use the simplest possible storage.

Possible options:

- Free database
- Lightweight storage
- External service


The database layer should be separated:

Example:

```

lib/database/

```

so it can be replaced later.

---

# 12. Authentication Architecture

Admin dashboard requires authentication.

Flow:

```

Admin
↓
Login
↓
Authentication Check
↓
Dashboard Access

```

Never store passwords directly.

Use:

- Hashed passwords
- Secure sessions
- Environment variables

---

# 13. File Storage Strategy

For demos:

Use:

```

public/

```

for static files.

For user uploads:

Use a separate storage system.

Do not store large files directly in the website repository.

---

# 14. API Architecture

API routes:

Example:

```

/api/chat

```

Handles:

- Chatbot requests


```

/api/leads

```

Handles:

- Lead submissions


```

/api/contact

```

Handles:

- Contact forms


---

# 15. Security Rules

Never expose:

- API keys
- Database credentials
- Admin secrets


Always:

- Validate inputs
- Limit requests
- Protect admin routes
- Sanitize user data

---

# 16. Scalability Rules

The architecture should allow:

Adding a new demo:

```

Create component
Add route
Add data entry

```

Adding a project:

```

Add project data
Add images
Deploy

```

Adding services:

```

Update services data

```

---

# 17. Final Architecture Goal

The final system should be:

```

Professional Website
+
Interactive AI Demos
+
Lead Generation System
+
Admin CRM
+
Future VPS Compatibility

```

The architecture should allow Floza to grow from a portfolio website into a full software company platform.
```
