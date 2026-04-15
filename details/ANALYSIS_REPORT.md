# Project Analysis Report: Syntax.market

## 1. Overview
**Syntax.market** is a premium academic engineering platform designed for modern developers and students (BCA, MCA, B.Tech, CS/IT). It facilitates the creation and management of custom technical projects across various domains.

---

## 2. Technology Stack
The platform is built with a state-of-the-art technical stack optimized for performance, responsiveness, and developer experience.

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: `react-router-dom` (v7)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/)
- **Forms**: `react-hook-form` + `zod`

### Backend & Infrastructure
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Google/GitHub)
- **Realtime**: Supabase Realtime for notifications
- **Deployment**: Vercel

---

## 3. Architecture & Components

### Core Layout
- **Layout.tsx**: The global wrapper containing the fixed header (with marquee ticker), main content area, and footer.
- **Sidebar.tsx**: A technical sidebar that is persistent on desktop and acts as a mobile drawer. It handles main navigation and user profile access.
- **NotificationBell.tsx**: Integrates with `notificationStore` to provide realtime system alerts.

### Business Logic
- **Scope Engine (`scopeEngine.ts`)**: The core algorithm that calculates project complexity (Tiers), features, and estimated delivery dates based on user budget and project domain.
- **Project Utils (`projectUtils.ts`)**: Handles pricing logic, including the **50% First-Project Discount** and delivery preference metadata.

---

## 4. Key Workflows

### Project Creation (Wizard)
The `NewProject.tsx` flow is a 4-step technical stepper:
1. **Node Domain**: AI/ML, Web Dev, Java, Data Structures, etc.
2. **Spec Details**: Title, description, and delivery preferences (Zip, Git Link, or Collab Invite).
3. **Resource Allocation**: Budget-based scope calibration using the Scope Engine.
4. **Broadcast Verification**: Final review and submission to the backend.

### Admin Dashboard (Kanban)
The `Requests.tsx` page provides a native-feeling Kanban board for administrators:
- **Horizontal Snap-Scroll**: Optimized for mobile touch interaction.
- **Status Management**: Realtime updates to project phases (Pending -> In Progress -> Completed).

---

## 5. Design System: "Obsidian + Ice Blue"
The platform features a curated aesthetic designed to feel "Engineers-only":
- **Matte Surfaces**: Deep Obsidian backgrounds (`#0B0F14`).
- **Technical Accents**: Ice Blue (`#5EE6FF`) and Mint Green for success states.
- **Typography**: Heavy reliance on Monospace fonts for technical metadata and high-contrast Black headings for emphasis.
- **Micro-animations**: Interactive pulse effects, glow transitions, and spring-based layouts.

---

## 6. Recent Overhaul (Mobile & Responsiveness)
Following the latest sprint, the following refinements were implemented:
- **Mobile Navigation**: Hamburger menu relocated to the right side for better ergonomic access.
- **Viewport Optimization**: Hero sections and Wizards adjusted to fit perfectly "above the fold" on all device heights.
- **Interactive UI**: Horizontal snap-scrolling implemented for Kanban boards to eliminate vertical list fatigue on mobile.
- **Security & Reliability**: Implemented robust profile-checking for discount eligibility and multi-layer button stacking for cramped screens.

---

## 7. Future Considerations
- **Admin Analytics**: Expanding the dashboard to include project distribution and revenue charts.
- **Realtime Collaboration**: Enhancing the "Project Detail" view with a lived-chat or terminal-styled progress log.
- **Expanded Scope Engine**: Adding more granular technology stacks (e.g., Rust, Go, Kubernetes).
