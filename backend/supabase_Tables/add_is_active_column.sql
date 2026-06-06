-- Migration to add is_active column to shop_tables
ALTER TABLE public.shop_tables ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
