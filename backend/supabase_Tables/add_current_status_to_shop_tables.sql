-- Add current_status column to track table sessions
ALTER TABLE public.shop_tables ADD COLUMN IF NOT EXISTS current_status TEXT DEFAULT 'available';
