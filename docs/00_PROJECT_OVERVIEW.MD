# Floza Project Overview

## 1. Project Name

**Floza**

Floza is an AI automation and software solutions company that builds custom workflows, AI assistants, websites, and digital systems for businesses.

---

# 2. Main Goal

The goal of the Floza website is to act as a professional company portfolio that:

- Shows what Floza can build
- Demonstrates automation capabilities through interactive demos
- Displays previous projects and case studies
- Converts visitors into qualified leads
- Builds trust with potential clients

The website should make a visitor think:

> "Floza can understand my business problems and build a solution."

---

# 3. Website Purpose

The website has four main purposes:

## 1. Showcase

Show visitors:
- AI automations
- Websites
- Landing pages
- Software projects
- Case studies

## 2. Demonstrate

Allow visitors to interact with realistic demos:

- AI Business Assistant
- Document Processing Workflow
- AI Lead Qualification + CRM Automation

## 3. Generate Leads

Convert visitors into potential customers through:

- AI chatbot
- Contact form
- Email contact
- WhatsApp/contact links
- Book a call option

## 4. Build Trust

Show:
- Professional design
- Previous work
- Technical ability
- Clear explanations of solutions

---

# 4. Target Customers

Primary customers:

## Small and Medium Businesses

Examples:

- Accounting firms
- Agencies
- Local businesses
- Service businesses
- Online businesses

They usually have problems with:

- Repetitive tasks
- Manual data entry
- Customer messages
- Lead management
- Document processing

---

# 5. Services Floza Offers

## AI Automation

Examples:

- AI customer assistants
- Workflow automation
- Document processing
- Lead qualification systems
- Internal business tools


## Website Development

Examples:

- Business websites
- Landing pages
- SaaS websites
- Dashboard interfaces


## Custom Software Solutions

Examples:

- Internal tools
- AI-powered systems
- Business dashboards

---

# 6. Website Style Direction

The website should feel like:

- A futuristic AI company
- A professional software studio
- A reliable technology partner

Design characteristics:

- Dark theme
- Modern UI
- Glass effects
- Smooth animations
- Dashboard-inspired designs
- Premium but simple

Avoid:

- Overly flashy animations
- Complicated layouts
- Generic templates
- Excessive text

---

# 7. Technical Requirements

The website must:

- Run completely on Vercel initially
- Be free or extremely low cost
- Be able to migrate to a VPS later
- Use a clean and scalable architecture
- Avoid unnecessary complexity

---

# 8. Development Principles

## Keep It Simple

Do not add features unless they provide value.

## Build For Growth

The first version should support:

- More projects
- More demos
- More services
- More clients

## Use Reusable Components

Common elements should be reusable:

- Cards
- Buttons
- Navigation
- Sections
- Forms

## Separate Data From Code

Content that changes often should not require rewriting components.

Examples:

Projects:

data/projects.json


Demos:

data/demos.json


---

# 9. First Version Features

## Public Website

Pages:

- Home
- Services
- Workflow Demos
- Projects
- Case Studies
- Contact


## Interactive Demos

### Demo 1:
AI Business Assistant

Features:
- Chat interface
- Maximum 5 messages per visitor
- Simulated business assistant


### Demo 2:
Document Processing Automation

Features:
- Upload up to 3 files
- AI extraction simulation
- Structured results


### Demo 3:
AI Lead Qualification + CRM Automation

Features:
- Simulated customer inquiry
- AI qualification questions
- Lead scoring
- CRM preview

---

# 10. Lead Generation System

The website should collect leads through:

## AI Chatbot

The chatbot should:

- Answer Floza questions
- Explain services
- Understand business problems
- Qualify potential customers
- Collect contact information


## Contact Form

Should collect:

- Name
- Email
- Company
- Business type
- Required service
- Project description


## Lead Storage

Collected leads should:

- Be saved
- Appear in admin dashboard
- Send an email notification

---

# 11. Admin Dashboard

Private dashboard:

Route:


/admin


Features:

- Login protection
- View leads
- Lead status tracking
- Conversation summaries
- Contact information

---

# 12. Hosting Strategy

## Phase 1

Hosting:

- Vercel

Architecture:

- Next.js
- Environment variables
- External services when needed


## Phase 2

Move to VPS:

Possible migration:

- Same codebase
- Different deployment method
- Updated environment variables

Avoid using features that lock the project to one platform.

---

# 13. Future Expansion

Possible future features:

- Blog/resources
- More interactive demos
- Client portals
- Team pages
- Analytics dashboard
- Automated proposal generation
- Customer onboarding system

---

# 14. Success Criteria

The website is successful when:

- Visitors understand Floza quickly
- Visitors interact with demos
- Visitors trust the company
- Leads are captured automatically
- Adding new projects is simple
- The system can grow without rebuilding