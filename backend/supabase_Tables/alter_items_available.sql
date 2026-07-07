-- Add is_available column to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;



-- Add theme_color column to shops table
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'dark';
