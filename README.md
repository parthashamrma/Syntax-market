# Syntax.market

On-Demand Student Project Platform

## Setup Instructions

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the following SQL in the Supabase SQL Editor to create the tables:

```sql
create table profiles (
  id uuid references auth.users primary key,
  email text,
  full_name text,
  college text,
  course text,
  created_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id),
  title text not null,
  domain text,
  description text,
  budget numeric not null,
  tier text,
  scope jsonb,
  tech_stack text[],
  status text default 'pending',
  deadline date,
  payment_status text default 'unpaid',
  deliverable_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  amount numeric,
  milestone text,
  razorpay_order_id text,
  razorpay_payment_id text,
  status text default 'pending',
  paid_at timestamptz
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  student_id uuid references profiles(id),
  message text,
  reply text,
  status text default 'open',
  created_at timestamptz default now()
);

create table components (
  id uuid primary key default gen_random_uuid(),
  name text,
  category text,
  description text,
  tech_stack text[],
  reuse_cost numeric,
  code_snippet text
);

-- Enable RLS
alter table profiles enable row level security;
alter table projects enable row level security;
alter table payments enable row level security;
alter table tickets enable row level security;
alter table components enable row level security;

-- Basic RLS Policies (For MVP, adjust as needed)
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own projects" on projects for select using (auth.uid() = student_id);
create policy "Users can insert own projects" on projects for insert with check (auth.uid() = student_id);
create policy "Users can update own projects" on projects for update using (auth.uid() = student_id);

create policy "Users can view own tickets" on tickets for select using (auth.uid() = student_id);
create policy "Users can insert own tickets" on tickets for insert with check (auth.uid() = student_id);

-- Note: In a real app, add admin policies using custom claims or an admin table.
```

3. Add your Supabase URL and Anon Key to `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the app: `npm run dev`
