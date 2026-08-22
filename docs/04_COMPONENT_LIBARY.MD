```md
# Floza Component Library

## 1. Purpose

This document defines all reusable UI components used throughout the Floza website.

The goal is to:

- Reduce duplicate code
- Keep design consistent
- Make future updates easier
- Allow new pages and features to be added quickly

All major UI elements should be built as reusable components instead of being recreated on every page.

---

# 2. Component Organization

Components should be organized by purpose:

```

components/

├── ui/
│   ├── Button
│   ├── Card
│   ├── Badge
│   ├── Input
│   └── Modal
│
├── layout/
│   ├── Navbar
│   ├── Footer
│   └── PageContainer
│
├── sections/
│   ├── Hero
│   ├── ServicesSection
│   ├── DemoSection
│   ├── ProjectsSection
│   └── ContactSection
│
├── projects/
│   ├── ProjectCard
│   ├── CaseStudySection
│   └── ProjectGallery
│
├── demos/
│   ├── DemoCard
│   ├── DemoContainer
│   └── DemoControls
│
├── chatbot/
│   ├── ChatButton
│   ├── ChatWindow
│   ├── MessageBubble
│   └── ChatInput
│
└── dashboard/
├── LeadCard
├── LeadTable
└── StatusBadge

```

---

# 3. Design System Components

## Button Component

Purpose:

A reusable button used throughout the website.

Types:

```

Primary
Secondary
Outline
Ghost

```


Examples:

Primary:

```

Start a Project

```


Secondary:

```

View Demos

```


Requirements:

- Consistent sizing
- Hover animation
- Mobile friendly
- Supports icons

---

# 4. Card Component

Purpose:

Used for displaying:

- Projects
- Services
- Demos
- Features


Structure:

```

Card

├── Image/Icon
├── Title
├── Description
└── Action Button

```


Features:

- Rounded corners
- Glass effect
- Hover animation
- Optional image

---

# 5. Badge Component

Purpose:

Small labels.

Examples:

```

AI Automation

Website

Dashboard

Featured

```


Used in:

- Project cards
- Service cards
- Demo pages

---

# 6. Navigation Components

## Navbar

Used:

Every public page.


Contains:

Left:

```

Floza Logo

```


Center:

```

Home
Services
Demos
Projects

```


Right:

```

Contact
Start Project

```


Features:

- Responsive mobile menu
- Sticky navigation
- Smooth scrolling

---

## Footer

Contains:

- Logo
- Short description
- Social links
- Contact links
- Copyright


---

# 7. Homepage Components

## Hero Section

Purpose:

First impression.

Contains:

- Main headline
- Supporting text
- CTA buttons
- Visual AI/software element


Example:

```

Build smarter workflows with AI

Floza creates automation systems
that help businesses work faster.

```


Actions:

```

Explore Demos

Start a Project

```


---

## Services Section

Displays:

- AI Automation
- Websites
- Software Solutions


Uses:

ServiceCard component


---

## Demo Section

Displays:

Three featured demos:

- AI Assistant
- Document Processing
- Lead CRM


Uses:

DemoCard component

---

## Projects Section

Displays:

Featured client builds.


Uses:

ProjectCard component

---

# 8. Project Components

## ProjectCard

Purpose:

Displays project previews.


Input:

```

title

description

category

image

slug

```


Example:

```

Invoice Automation

AI workflow for processing invoices

Automation

View Case Study

```


---

## CaseStudySection

Purpose:

Reusable sections inside project pages.


Types:

```

Problem

Solution

Workflow

Screenshots

Results

Technology

```


---

## ProjectGallery

Purpose:

Displays:

- Screenshots
- Videos
- Images


Features:

- Image viewer
- Responsive layout

---

# 9. Demo Components

## DemoCard

Purpose:

Preview interactive demos.


Input:

```

name

description

category

route

image

```


---

## DemoContainer

Purpose:

Wrapper around interactive demos.


Handles:

- Layout
- Loading state
- Instructions


---

## DemoControls

Used for:

- Buttons
- Inputs
- Upload controls
- Actions


---

# 10. Chatbot Components

## ChatButton

Purpose:

Floating button visible on website.


Position:

Bottom-right.


Features:

- Opens chat window
- Shows notification badge


---

## ChatWindow

Contains:

```

Header

Conversation area

Input area

```


---

## MessageBubble

Displays:

User messages

AI messages


Types:

```

User

Assistant

```


---

## ChatInput

Handles:

- User messages
- Sending
- Loading state

---

# 11. Contact Components

## ContactForm

Fields:

Required:

```

Name

Email

Company

Message

```


Optional:

```

Service needed

Budget

Timeline

```


Features:

- Validation
- Loading state
- Success message

---

# 12. Admin Dashboard Components

## LeadCard

Displays:

```

Name

Company

Service

Status

Date

```


---

## LeadTable

Displays multiple leads.


Columns:

```

Name

Company

Email

Service

Status

Date

```


---

## StatusBadge

Statuses:

```

New

Contacted

In Progress

Completed

```


---

# 13. Animation Rules

Animations should be consistent.

Use:

- Fade in
- Slide up
- Hover effects
- Smooth transitions


Avoid:

- Constant movement
- Large distracting effects

---

# 14. Responsive Rules

Every component must support:

## Desktop

Large layouts

## Tablet

Adjusted spacing

## Mobile

Stacked layouts

Touch-friendly buttons

---

# 15. Component Creation Rules

Before creating a new component:

Ask:

1. Will this be reused?
2. Does it belong in an existing component?
3. Will it make future changes easier?


Avoid:

- Copy-pasting components
- Creating unnecessary components
- Mixing business logic with UI

---

# 16. Final Component Goal

The component system should allow:

Adding a new project:

```

Add data
↓
ProjectCard displays it
↓
Case study page generates

```


Adding a new demo:

```

Create demo component
↓
Add route
↓
Add DemoCard

```


The website should grow by adding components and data, not rewriting existing code.
```
