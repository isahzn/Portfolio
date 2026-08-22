```md id="r4m92k"
# Floza Project & Case Study System

## 1. Purpose

This document defines how Floza projects are displayed, organized, and expanded over time.

The goal is to create a professional portfolio system where every project can become a detailed case study.

The system should support:

- Adding unlimited projects
- Showing different project types
- Creating detailed case studies
- Displaying screenshots and demos
- Explaining business value

---

# 2. Project Types

Floza projects can have different categories.

Available categories:

```

AI Automation

Website

Landing Page

Software

Dashboard

AI Agent

```

---

# 3. Project Display System

Projects have two levels:

## Level 1: Project Cards

Used on:

- Homepage
- Projects page

Purpose:

Quick overview.

Contains:

```

Project image

Title

Category

Short description

View Case Study button

```

---

## Level 2: Full Case Study

Used on:

```

/projects/[slug]

```

Purpose:

Explain the project in detail.

Contains:

```

Overview

Problem

Solution

Workflow

Screenshots

Technology

Results

CTA

```

---

# 4. Project Data Structure

Projects are stored separately from code.

Location:

```

data/projects.json

````

---

Example:

```json
[
  {
    "slug": "invoice-automation",
    "title": "Invoice Automation System",
    "category": "AI Automation",
    "shortDescription": "An AI workflow that extracts invoice data automatically.",
    "image": "/projects/invoice.png",
    "featured": true
  }
]
````

---

# 5. Project Fields

## Slug

Used for URL.

Example:

```
invoice-automation
```

Creates:

```
/projects/invoice-automation
```

---

## Title

Displayed name.

Example:

```
Invoice Automation System
```

---

## Category

Example:

```
AI Automation
```

---

## Short Description

Used in cards.

Should explain:

* What it does
* Who it helps

Maximum:

2-3 sentences.

---

## Image

Main project image.

Location:

```
public/projects/
```

---

## Featured

Controls whether it appears on homepage.

Values:

```
true

false
```

---

# 6. Case Study Structure

Every detailed project page follows this structure.

---

# Section 1: Hero

Contains:

* Project title
* Category
* Short explanation
* Main visual

Example:

```
Invoice Automation System

AI-powered workflow that removes manual invoice processing.
```

---

# Section 2: Problem

Purpose:

Explain the business challenge.

Include:

* Manual processes
* Time-consuming tasks
* Existing problems

Example:

```
The company manually processed hundreds of invoices every month, creating delays and errors.
```

---

# Section 3: Solution

Explain:

What Floza built.

Include:

* Automation logic
* AI systems
* User interface
* Integrations

Example:

```
Floza created a workflow that reads invoices, extracts information, and organizes data automatically.
```

---

# Section 4: Workflow

Visual explanation.

Format:

```
Input

↓

AI Processing

↓

Automation

↓

Final Result
```

Example:

```
Invoice Upload

↓

AI Extraction

↓

Database Storage

↓

Dashboard View
```

---

# Section 5: Screenshots

Show:

* UI images
* Dashboards
* Workflow screens
* Before/after comparisons

---

# Section 6: Technology

Optional section.

Example:

```
Next.js

AI API

Database

Automation Tools
```

---

# Section 7: Results

Explain improvements.

Examples:

* Reduced manual work
* Faster processing
* Better organization

Important:

Only use exact numbers if they are real.

Avoid fake claims.

---

# Section 8: CTA

Every case study ends with:

```
Need a system like this?

Let's build your automation.

Contact Floza →
```

---

# 7. Adding A New Project

Process:

```
Create project images

↓

Add project data

↓

Add case study content

↓

Deploy
```

No code changes should be required for normal projects.

---

# 8. Future Project Features

Possible additions:

## Filtering

Allow visitors to filter:

```
All

Automation

Websites

AI Agents
```

---

## Search

Search projects by:

* Name
* Category
* Technology

---

## Project Gallery

Add:

* Multiple images
* Videos
* Interactive demos

---

## Client Portal

Future:

Clients can view:

* Project progress
* Files
* Updates

---

# 9. Project Quality Rules

Every project should:

✓ Explain a real problem
✓ Show the solution clearly
✓ Include visuals
✓ Explain business value
✓ Have a clear CTA

Avoid:

✗ Empty project pages
✗ Fake client results
✗ Technical explanations without business context
✗ Projects without visuals

---

# 10. Final Goal

The project system should make Floza look like a professional software company.

A visitor should understand:

* What was built
* Why it matters
* How it works
* How Floza can help them

```
```
