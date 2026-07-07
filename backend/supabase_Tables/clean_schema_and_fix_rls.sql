-- SQL: Safe cleanup of duplicate columns and configuration of public insert policy

-- 1. Safely migrate existing data on registrations before dropping columns
DO $$
BEGIN
  -- If phone exists, copy it to mobile where mobile is null
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'registrations' 
    AND column_name = 'phone'
  ) THEN
    EXECUTE 'UPDATE public.registrations SET mobile = COALESCE(mobile, phone) WHERE mobile IS NULL';
  END IF;

  -- If submitted_at exists, copy it to created_at where created_at is null
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'registrations' 
    AND column_name = 'submitted_at'
  ) THEN
    EXECUTE 'UPDATE public.registrations SET created_at = COALESCE(created_at, submitted_at) WHERE created_at IS NULL';
  END IF;
END;
$$;

-- 2. Drop duplicate/redundant columns from registrations
ALTER TABLE public.registrations DROP COLUMN IF EXISTS phone;
ALTER TABLE public.registrations DROP COLUMN IF EXISTS submitted_at;

-- 3. Drop duplicate/redundant columns from shops
ALTER TABLE public.shops DROP COLUMN IF EXISTS published;
ALTER TABLE public.shops DROP COLUMN IF EXISTS is_approved;

-- 4. Enable RLS on registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can insert their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;

-- 6. Create robust insert policy allowing anyone (anonymous users) to register
CREATE POLICY "Anyone can insert registrations" ON public.registrations
  FOR INSERT WITH CHECK (true);

-- 7. Create select policy allowing users to view their own registration and admins to view all
CREATE POLICY "Users can view their own registrations" ON public.registrations
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- 8. Enable Realtime for registrations table safely
DO $$
BEGIN
  -- Create publication if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- Add table to publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'registrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
  END IF;
END;
$$;

