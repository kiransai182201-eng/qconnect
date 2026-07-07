-- SQL Fix: Re-create registrations policies from scratch to ensure no conflicts

-- 1. Drop any existing policies on public.registrations
DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can insert their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can delete registrations" ON public.registrations;

-- 2. Create the insert policy (Allow anyone to submit a registration)
CREATE POLICY "Anyone can insert registrations" ON public.registrations
  FOR INSERT WITH CHECK (true);

-- 3. Create the select policy (Owners can see their own, admins can see all)
CREATE POLICY "Users can view their own registrations" ON public.registrations
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- 4. Create the update policy (Only admins can review/approve registrations)
CREATE POLICY "Admins can update registrations" ON public.registrations
  FOR UPDATE USING (is_admin());

-- 5. Create the delete policy (Only admins can delete registrations)
CREATE POLICY "Admins can delete registrations" ON public.registrations
  FOR DELETE USING (is_admin());
