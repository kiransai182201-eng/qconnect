-- SQL: Align registrations table with user's specific database schema

CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile TEXT NOT NULL,
    address TEXT,
    tables INTEGER DEFAULT 5,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by TEXT,
    rejection_reason TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category TEXT,
    logo_url TEXT
);

-- Ensure all columns exist in case the table was already created in a previous step
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

