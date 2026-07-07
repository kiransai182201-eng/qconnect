-- 1. Add missing columns to shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Create shop_tables table
CREATE TABLE IF NOT EXISTS public.shop_tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    table_number INTEGER NOT NULL,
    table_code TEXT NOT NULL,
    qr_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.shop_tables ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Anyone can view shop tables" ON public.shop_tables;
CREATE POLICY "Anyone can view shop tables" 
    ON public.shop_tables FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Shop owners can manage their tables" ON public.shop_tables;
CREATE POLICY "Shop owners can manage their tables" 
    ON public.shop_tables FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.shops 
            WHERE shops.id = shop_tables.shop_id 
            AND shops.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shops 
            WHERE shops.id = shop_tables.shop_id 
            AND shops.user_id = auth.uid()
        )
    );
