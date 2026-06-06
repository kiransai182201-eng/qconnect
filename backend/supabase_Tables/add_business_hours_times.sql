-- Add global business hours time columns to the shops table
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS open_time TEXT DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS close_time TEXT DEFAULT '22:00';
