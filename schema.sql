-- Create the invoices table if it doesn't exist
create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  invoice_number text not null,
  buyer_name text,
  invoice_date date,
  total_amount numeric,
  form_data jsonb,
  items jsonb,
  user_id uuid references auth.users(id)
);

-- EMERGENCY FIX: Disable Row Level Security temporarily to verify connection
alter table invoices disable row level security;

-- NOTE: If you want to re-enable it later, run:
-- alter table invoices enable row level security;
-- And re-apply the policies.
