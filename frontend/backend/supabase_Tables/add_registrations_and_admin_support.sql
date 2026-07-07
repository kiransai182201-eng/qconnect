-- Migration: Add registrations table and admin RLS support
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    address TEXT,
    category TEXT,
    tables INTEGER DEFAULT 5,
    logo_url TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING | APPROVED | REJECTED
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.email() IN ('sunnykiran715@gmail.com', 'revanthrevanth4248@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for registrations
DROP POLICY IF EXISTS "Users can insert their own registrations" ON public.registrations;
CREATE POLICY "Users can insert their own registrations" ON public.registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;
CREATE POLICY "Users can view their own registrations" ON public.registrations
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Admins can update registrations" ON public.registrations;
CREATE POLICY "Admins can update registrations" ON public.registrations
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete registrations" ON public.registrations;
CREATE POLICY "Admins can delete registrations" ON public.registrations
  FOR DELETE USING (is_admin());

-- Update RLS policies for public.shops to allow admin access
DROP POLICY IF EXISTS "Admins can manage all shops" ON public.shops;
CREATE POLICY "Admins can manage all shops" ON public.shops
  FOR ALL USING (is_admin());

-- Update RLS policies for public.shop_tables to allow admin access
DROP POLICY IF EXISTS "Admins can manage all tables" ON public.shop_tables;
CREATE POLICY "Admins can manage all tables" ON public.shop_tables
  FOR ALL USING (is_admin());

-- Update RLS policies for public.categories to allow admin access
DROP POLICY IF EXISTS "Admins can manage all categories" ON public.categories;
CREATE POLICY "Admins can manage all categories" ON public.categories
  FOR ALL USING (is_admin());
