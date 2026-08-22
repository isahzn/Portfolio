```md id="m4j8qs"
# Floza Data Model

## 1. Purpose

This document defines how information is structured and stored inside the Floza website.

The data model should:

- Keep content separate from code
- Make adding projects simple
- Support the CRM system
- Allow future migration to different databases
- Keep the architecture flexible

---

# 2. Data Storage Strategy

## Initial Version

Use a hybrid approach.

Static content:

Stored as files:

```

data/

```

Examples:

- Projects
- Services
- Demo information
- Website content

Dynamic data:

Stored in a database:

Examples:

- Leads
- Conversations
- Admin information

---

# 3. Static Data Structure

Location:

```

/data

```

Contains:

```

projects.json

demos.json

services.json

```

---

# 4. Projects Data Model

File:

```

data/projects.json

````

Purpose:

Stores all completed builds and case studies.

Example:

```json
[
  {
    "id": "invoice-automation",
    "title": "Invoice Automation System",
    "category": "AI Automation",
    "shortDescription": "AI workflow that processes invoices automatically.",
    "image": "/projects/invoice.png",
    "featured": true,
    "slug": "invoice-automation"
  }
]
````

---

## Project Fields

### id

Unique identifier.

Example:

```
invoice-automation
```

---

### title

Project display name.

Example:

```
Invoice Automation System
```

---

### category

Type of project.

Options:

```
AI Automation

Website

Landing Page

Dashboard

Software
```

---

### shortDescription

Short preview text.

Used on:

* Project cards
* Homepage

---

### image

Main project image.

Example:

```
/projects/project1.png
```

---

### featured

Controls homepage visibility.

Values:

```
true

false
```

---

### slug

URL identifier.

Example:

```
/projects/invoice-automation
```

---

# 5. Case Study Data Model

Each project can contain detailed information.

Example:

```json
{
  "problem": "",
  "solution": "",
  "workflow": [],
  "screenshots": [],
  "results": [],
  "technologies": []
}
```

---

## Problem

Explains:

* Client/business challenge
* Manual process
* Pain points

---

## Solution

Explains:

* What Floza built
* How it works
* Main features

---

## Workflow

Stores process steps.

Example:

```json
[
  "Document uploaded",
  "AI extracts information",
  "Data sent to dashboard"
]
```

---

## Screenshots

Stores project visuals.

Example:

```json
[
 "/projects/image1.png",
 "/projects/image2.png"
]
```

---

## Results

Stores outcomes.

Example:

```
Reduced manual work

Faster processing

Better organization
```

Only use real numbers if they are proven.

---

# 6. Demo Data Model

File:

```
data/demos.json
```

Purpose:

Controls demo listings.

Example:

```json
[
 {
  "id": "ai-assistant",
  "title": "AI Business Assistant",
  "category": "AI Automation",
  "description": "Interactive AI customer assistant demo.",
  "route": "/demos/ai-assistant"
 }
]
```

---

## Demo Fields

### id

Unique identifier.

---

### title

Demo name.

---

### category

Example:

```
Automation
AI Agent
Workflow
```

---

### description

Short explanation.

---

### route

Demo URL.

Example:

```
/demos/document-processing
```

---

# 7. Services Data Model

File:

```
data/services.json
```

Purpose:

Stores service offerings.

Example:

```json
[
 {
  "title": "AI Automation",
  "description": "Build intelligent workflows.",
  "features": [
    "AI assistants",
    "Document processing",
    "CRM automation"
  ]
 }
]
```

---

# 8. Lead Data Model

Dynamic database.

Purpose:

Stores potential customers.

Example:

```json
{
 "name": "",
 "email": "",
 "company": "",
 "service": "",
 "message": "",
 "status": "new",
 "createdAt": ""
}
```

---

## Lead Fields

### name

Person's name.

---

### email

Contact email.

---

### company

Business/company name.

---

### service

Requested service.

Examples:

```
AI Automation

Website

Custom Software
```

---

### message

Customer requirements.

---

### status

Lead pipeline status.

Values:

```
new

contacted

qualified

closed
```

---

### createdAt

Date created.

---

# 9. Conversation Data Model

Purpose:

Stores chatbot conversations.

Example:

```json
{
 "leadId": "",
 "messages": [],
 "summary": "",
 "createdAt": ""
}
```

---

## Messages Structure

Example:

```json
[
 {
  "role": "user",
  "content": "I need automation"
 },
 {
  "role": "assistant",
  "content": "What process?"
 }
]
```

---

# 10. Admin User Model

Purpose:

Controls dashboard access.

Example:

```json
{
 "email": "",
 "passwordHash": "",
 "role": "admin"
}
```

---

# 11. Environment Variables

Sensitive data should never be stored in files.

Example:

```
.env
```

Contains:

```
AI_API_KEY=

DATABASE_URL=

EMAIL_API_KEY=

ADMIN_SECRET=
```

---

# 12. Database Abstraction

Database operations should be separated.

Example:

```
lib/database/
```

Contains:

```
createLead()

getLeads()

updateLead()

saveConversation()
```

---

Reason:

If the database changes later:

Example:

Free database → VPS database

Only this layer changes.

The website code stays the same.

---

# 13. Future Expansion Models

Possible future additions:

## Client Model

Stores:

* Clients
* Projects
* Communication

## Invoice Model

Stores:

* Payments
* Plans
* Billing

## Analytics Model

Stores:

* Visitors
* Demo usage
* Conversions

---

# 14. Data Rules

Always:

✓ Validate user input
✓ Protect sensitive data
✓ Separate static and dynamic data
✓ Keep structures simple
✓ Design for future growth

Never:

✗ Store API keys in data files
✗ Store passwords directly
✗ Hardcode changing content everywhere

---

# 15. Final Data Goal

The data architecture should allow Floza to:

* Add projects easily
* Add demos easily
* Manage leads
* Build a CRM
* Move hosting later
* Grow into a larger platform

```
```
