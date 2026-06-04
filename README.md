# Otto

**Otto** is a modern Learning Management Platform (LMP) built as a performant monorepo. It provides a full-featured learning experience for students and powerful management tools for administrators — all wrapped in a warm, minimal design system inspired by Cursor.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Build](#build)
- [Applications](#applications)
  - [Web — Learning Platform](#web--learning-platform)
  - [Dashboard — Admin Panel](#dashboard--admin-panel)
  - [Docs — Documentation Site](#docs--documentation-site)
  - [Otto — Main App](#otto--main-app)
- [Shared Packages](#shared-packages)
- [Design System](#design-system)
- [Features](#features)
- [Architecture Decisions](#architecture-decisions)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Otto is a learning management platform designed for clarity, speed, and a delightful user experience. It consists of multiple Next.js applications managed under a Turborepo monorepo, sharing a common UI component library, TypeScript configurations, and ESLint rules.

The platform is split into student-facing and admin-facing applications:

| App | Port | Purpose |
|-----|------|---------|
| **web** | `3000` | Student-facing learning platform |
| **docs** | `3001` | Project documentation site |
| **dashboard** | `3002` | Admin course & quiz management |
| **otto** | `3003` | Main application entry point |

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + custom design tokens |
| **Component Primitives** | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Monorepo** | [Turborepo](https://turborepo.dev/) |
| **Package Manager** | [pnpm](https://pnpm.io/) |
| **Authentication** | [Better Auth](https://better-auth.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) + [Phosphor Icons](https://phosphoricons.com/) |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) |
| **Linting** | [ESLint](https://eslint.org/) |
| **Formatting** | [Prettier](https://prettier.io/) |

---

## Project Structure

```
otto/
├── apps/
│   ├── web/                  # Student-facing learning platform (port 3000)
│   │   ├── app/
│   │   │   ├── courses/      # Course catalog, browsing, and viewing
│   │   │   ├── community/    # Discussion forums and social learning
│   │   │   ├── dashboard/    # User dashboard with learning stats
│   │   │   ├── quizzes/      # Quiz-taking interface
│   │   │   └── settings/     # Profile, theme, and notification preferences
│   │   ├── components/       # App-specific UI components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities, helpers, and mock data
│   │
│   ├── dashboard/            # Admin management panel (port 3002)
│   │   └── app/
│   │       ├── courses/      # Course creation and management
│   │       ├── quizzes/      # Quiz creation and management
│   │       └── settings/     # Admin settings
│   │
│   ├── docs/                 # Documentation site (port 3001)
│   │
│   └── otto/                 # Main application (port 3003)
│
├── packages/
│   ├── ui/                   # Shared UI component library (@repo/ui)
│   ├── eslint-config/        # Shared ESLint configurations (@repo/eslint-config)
│   └── typescript-config/    # Shared TypeScript configurations (@repo/typescript-config)
│
├── turbo.json                # Turborepo pipeline configuration
├── pnpm-workspace.yaml       # pnpm workspace definition
└── package.json              # Root package scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (install with `corepack enable` or `npm install -g pnpm`)
- **PostgreSQL** (running locally or via a connection string)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd otto

# Install dependencies
pnpm install
```

### Development

Start all applications in development mode:

```bash
pnpm dev
```

Start a specific application:

```bash
# Student platform
pnpm dev --filter=web

# Admin dashboard
pnpm dev --filter=dashboard

# Documentation
pnpm dev --filter=docs

# Main app
pnpm dev --filter=otto
```

Each app will be available at `http://localhost:<port>` (see [Overview](#overview) for ports).

### Build

Build all applications and packages:

```bash
pnpm build
```

Build a specific application:

```bash
pnpm build --filter=web
```

---

## Applications

### Web — Learning Platform

The primary student-facing application. Users can browse courses, track progress, take quizzes, and engage with the community.

**Key routes:**

| Route | Description |
|-------|-------------|
| `/` | Landing / home page |
| `/courses` | Browse and filter the course catalog |
| `/courses/[id]` | View a specific course with lessons |
| `/dashboard` | Personal dashboard with learning statistics |
| `/quizzes` | Browse available quizzes |
| `/community` | Discussion forums and peer interaction |
| `/settings` | Profile, theme, and notification preferences |

**Key components:**

- **CourseCard** — Displays course overview with progress tracking
- **QuizPreviewModal** — Interactive quiz preview with answer selection
- **Sidebar** — Persistent navigation with theme-aware styling
- **LoginForm** — Authentication form with social login options
- **ProgressTracker** — Visual progress bars for course completion

### Dashboard — Admin Panel

The admin-facing application for managing platform content.

**Key routes:**

| Route | Description |
|-------|-------------|
| `/` | Admin overview with analytics |
| `/courses` | Create, edit, and manage courses |
| `/quizzes` | Create, edit, and manage quizzes |
| `/settings` | Admin configuration and permissions |

### Docs — Documentation Site

A lightweight documentation site for project references and guides (port 3001).

### Otto — Main App

The main application entry point running on port 3003.

---

## Shared Packages

### `@repo/ui` — Component Library

A shared React component library used across all applications. Built on top of Radix UI primitives and styled with Tailwind CSS following the shadcn/ui pattern.

**Included components:**

- **Button** — Variant-rich button with multiple sizes and styles
- **Input** — Form input with consistent styling and accessibility
- **Label** — Accessible form labels
- **Separator** — Visual divider component
- **Sheet** — Slide-out panel (mobile-friendly)
- **Skeleton** — Loading placeholder
- **Tooltip** — Accessible hover information
- **LoginForm** — Full authentication form component

All components support dark/light themes and follow WAI-ARIA accessibility standards.

### `@repo/eslint-config`

Shared ESLint configurations including:

- `eslint-config-next` for Next.js-specific rules
- `eslint-config-prettier` to disable conflicting formatting rules

### `@repo/typescript-config`

Shared `tsconfig.json` base configurations used throughout the monorepo for consistency.

---

## Design System

Otto uses a custom design system inspired by **Cursor's warm minimalism**. The system is built on CSS custom properties and Tailwind CSS utility classes.

### Typography

Three distinct font families are used to create visual hierarchy:

| Font | Usage | Style |
|------|-------|-------|
| **CursorGothic** | Display headings & UI labels | Clean geometric sans-serif |
| **Jannon** | Body text & long-form content | Elegant serif for readability |
| **Berkeley Mono** | Code blocks & monospace content | Classic monospace for clarity |

### Color Palette

The color system uses CSS custom properties with automatic dark/light mode support. Key tokens include:

- **Background / Foreground** — Base surface colors
- **Primary / Secondary** — Brand accent colors
- **Muted** — Subdued backgrounds and text
- **Accent** — Highlighted elements
- **Destructive** — Error and warning states
- **Card** — Elevated surface colors

All color tokens have corresponding `-foreground` variants for accessible contrast.

### Spacing

An 8px base grid with sub-8px increments for fine-tuned layouts. Consistent spacing tokens ensure visual rhythm across all components.

### Shadows & Depth

A multi-layer shadow system for creating realistic elevation:

- **sm** — Subtle lift for cards and containers
- **md** — Standard elevation for dropdowns and modals
- **lg** — Prominent elevation for overlays
- **xl** — Maximum elevation for top-level modals

### Theme Support

Full dark and light mode support powered by `next-themes`. Theme switching is available in user settings and respects system preferences by default.

---

## Features

### For Students

- 📚 **Course Catalog** — Browse, search, and filter courses by category and difficulty level
- 📊 **Progress Tracking** — Visual progress bars and completion statistics
- 🎯 **Quizzes** — Interactive quiz-taking with instant feedback and score tracking
- 💬 **Community** — Discussion forums for peer-to-peer learning
- 🎨 **Theme Preferences** — Dark, light, and system theme options
- 📱 **Responsive Design** — Mobile-first layout that works on all screen sizes

### For Administrators

- 🛠 **Course Management** — Create, edit, and organize courses and lessons
- ✅ **Quiz Builder** — Create and manage quizzes with multiple question types
- 👥 **User Management** — Manage user roles and permissions
- ⚙️ **Settings** — Platform-wide configuration and admin controls
- 📈 **Analytics** — Track platform usage and learning outcomes

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Turborepo monorepo** | Shared code, cached builds, and unified tooling across apps |
| **App Router (Next.js)** | Server components, streaming, and modern React patterns |
| **Tailwind CSS** | Utility-first styling with design tokens for consistency |
| **Radix UI + shadcn/ui** | Accessible primitives with full customization control |
| **No global state library** | Server components and React hooks reduce the need for Redux/Zustand |
| **pnpm workspaces** | Fast, disk-efficient dependency management |
| **Custom design system** | Cohesive brand identity with warm minimalism aesthetic |

---

## Scripts

All scripts are run from the project root using pnpm:

```bash
# Development
pnpm dev                    # Start all apps in dev mode
pnpm dev --filter=<app>     # Start a specific app

# Building
pnpm build                  # Build all apps and packages
pnpm build --filter=<app>   # Build a specific app

# Code Quality
pnpm lint                   # Run ESLint across all packages
pnpm format                 # Format code with Prettier
pnpm check-types            # Run TypeScript type checking

# Turborepo (alternative)
npx turbo dev               # Dev with Turborepo caching
npx turbo build             # Build with Turborepo caching
npx turbo lint              # Lint with Turborepo caching
```

---

## Contributing

1. Create a feature branch from `dev`: `git checkout -b feat/your-feature dev`
2. Make your changes and ensure linting/type-checking passes
3. Commit with descriptive messages
4. Open a pull request against the `dev` branch

### Code Standards

- All code is written in **TypeScript**
- Follow the existing component patterns from `@repo/ui`
- Use **Tailwind CSS** classes for styling — avoid inline styles
- Ensure components are **accessible** (proper ARIA attributes, keyboard navigation)
- Test in both **dark and light** themes
- Verify **responsive** layouts on mobile and desktop

---

## License

All rights reserved.
