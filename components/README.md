# Floza Component System

Components are organized by purpose (docs/04_COMPONENT_LIBARY.MD) so the site grows by
adding components and data, not by rewriting existing code.

| Folder        | Purpose                                    | Contents (current → planned)                                  |
| ------------- | ------------------------------------------ | ------------------------------------------------------------- |
| `ui/`         | Design primitives                          | Button, Card, Badge, Input, Textarea, Select, Modal, icons    |
| `layout/`     | Shared page structure                      | PageContainer, Logo, Navbar, Footer                           |
| `sections/`   | Page sections                             | Hero, ServicesSection, ContactCta, ContactForm |
| `projects/`   | Portfolio system                           | ProjectCard, ProjectVisual, ProjectGrid (filter), CaseStudySection, WorkflowSteps → ProjectGallery |
| `demos/`      | Interactive demo UI                        | DemoCard, DemoSection, DemoFrame, DemoShell, AiAssistantDemo, DocumentProcessingDemo, LeadCrmDemo |
| `chatbot/`    | AI assistant UI                            | → ChatButton, ChatWindow, MessageBubble, ChatInput            |
| `dashboard/`  | Admin lead management                      | → LeadCard, LeadTable, StatusBadge                            |

## Design conventions (docs/01_BRAND_GUIDE.MD)

- **Theme:** dark editorial (`background` #07080b, `foreground` #e7e8ed), indigo
  `primary` (#5468e0). Tokens live in `app/globals.css` (`@theme`) and are used as
  utilities (`text-primary`, `border-border-soft/30`, `text-faint`, …).
- **Typography:** Inter (UI), IBM Plex Mono (labels/metadata — `font-mono`), Instrument
  Serif (italic display accents — `.serif-em` or `em` inside `.section-title`). Use the
  `.section-title` / `.section-subtitle` component classes for consistent section
  headings; hero eyebrow via `.eyebrow`.
- **Spacing:** Tailwind's default 4px scale; sections `py-20`/`py-24`, cards `p-6`,
  consistent page width via `PageContainer` (max 1180px).
- **Motion:** subtle fade/slide-ins — tokens `animate-overlay-in` and `animate-panel-in`
  are defined in `globals.css`; hover effects use Tailwind transitions. Framer Motion is
  reserved for section-level animations in later phases.
- **Surfaces:** hairline borders `border-border`/`border-border-soft`, dark surfaces
  `bg-surface`/`bg-surface-2` (see `Card`). Ambient film-grain + accent field overlay
  live in the root layout (`.grain` / `.field`).

## Rules

- Reuse an existing component before creating a new one.
- Keep business logic out of UI components.
- Prefer Server Components; add `"use client"` only where interactivity is needed
  (docs/03_TECH_ARCHITECTURE.MD).
