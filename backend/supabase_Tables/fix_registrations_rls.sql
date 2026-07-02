-- SQL Patch: Fix RLS for Registration Inserts and Admin Checks

-- 1. Enhance is_admin() function to reliably check email from JWT claims
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('request.jwt.claims', true), '')::json->>'email',
    auth.email()
  ) IN ('sunnykiran715@gmail.com', 'revanthrevanth4248@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Allow public inserts on the registrations table (safe since status defaults to PENDING)
DROP POLICY IF EXISTS "Users can insert their own registrations" ON public.registrations;
CREATE POLICY "Anyone can insert registrations" ON public.registrations
  FOR INSERT WITH CHECK (true);
