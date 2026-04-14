# 🚀 Syntax.market

**High-Fidelity Project Engine for Modern Students**

Syntax.market is a premium on-demand platform designed to bridge the gap between academic requirements and professional-grade software development. Built with a focus on speed, quality, and a high-fidelity "developer" aesthetic.

---

## ✨ Features

- **⚡ High-Fidelity Design**: Strict purple-and-black premium aesthetic with glassmorphism, dot-grid backgrounds, and micro-animations.
- **📈 Project Budget Engine**: Interactive 4-step project creation flow with dynamic scope and budget calculation (₹200–₹5,000).
- **🛡️ Admin Control Center**: Unified Kanban-style board for managing project requests, viewing live platform stats, and issuing system-wide broadcasts.
- **🔔 Live Notifications**: Real-time status updates and admin broadcasts delivered via a persistent sidebar notification system.
- **📂 Floating Terminal Snippets**: Interactive landing page featuring drifting code snippet cards powered by Framer Motion.
- **🧠 Domain Coverage**: Ready-to-ship projects in AI/ML, Python, Web Dev, Java, Android, and more.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript |
| **Styling** | Tailwind CSS (Core), Framer Motion (Animations) |
| **Database/Auth** | Supabase (PostgreSQL) |
| **Icons** | Lucide React |
| **State Management** | Zustand |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- NPM or PNPM
- A Supabase Project

### 2. Setup Environment
Create a `.env` file in the root directory and add:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema
Run the following SQL in your Supabase SQL Editor to initialize the required tables:

```sql
-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  full_name text,
  college text,
  course text,
  role text default 'CLIENT',
  created_at timestamptz default now()
);

-- Projects table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id),
  title text not null,
  domain text,
  description text,
  budget numeric,
  tier text,
  scope jsonb,
  status text default 'pending',
  payment_status text default 'unpaid',
  created_at timestamptz default now()
);

-- Notifications table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text,
  message text,
  type text default 'info',
  is_read boolean default false,
  created_at timestamptz default now()
);
```

### 4. Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 🔑 Permissions & Access

- **Admin Access**: User permissions are hardcoded to grant Admin status to `ps4689203@gmail.com`. Admins have access to the `/admin/requests` analytics and broadcast features.
- **Security**: The platform uses Supabase Row Level Security (RLS) to ensure project privacy and secure data fetching.

---

## 📦 Project Structure

```text
/src
  /components
    /layout     - Sidebar, Header, Ticker
    /ui         - Reusable design system components
  /lib          - Supabase client & utilities
  /pages        - Feature-specific views (Landing, Admin, Dashboard)
  /store        - Zustand state management
  /App.tsx      - Route definitions
  /index.css    - Global theme design tokens
```

---

## 📄 License
© 2024 Syntax.market. Built with ❤️ for the student community.
