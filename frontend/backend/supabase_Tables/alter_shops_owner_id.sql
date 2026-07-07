-- Add owner_unique_id column to shops table
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS owner_unique_id TEXT;

