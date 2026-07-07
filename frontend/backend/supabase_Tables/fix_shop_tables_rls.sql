-- Enable RLS
ALTER TABLE public.shop_tables ENABLE ROW LEVEL SECURITY;

-- 1. Select policy (Anyone can view tables)
DROP POLICY IF EXISTS "Anyone can view shop tables" ON public.shop_tables;
CREATE POLICY "Anyone can view shop tables" 
    ON public.shop_tables FOR SELECT 
    USING (true);

-- 2. Insert policy (Owners can insert tables)
DROP POLICY IF EXISTS "Shop owners can insert tables" ON public.shop_tables;
DROP POLICY IF EXISTS "Shop owners can manage their tables" ON public.shop_tables;
CREATE POLICY "Shop owners can insert tables" 
    ON public.shop_tables FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shops 
            WHERE shops.id = shop_tables.shop_id 
            AND shops.user_id = auth.uid()
        )
    );

-- 3. Update policy (Owners can update tables)
DROP POLICY IF EXISTS "Shop owners can update tables" ON public.shop_tables;
CREATE POLICY "Shop owners can update tables" 
    ON public.shop_tables FOR UPDATE 
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

-- 4. Delete policy (Owners can delete tables)
DROP POLICY IF EXISTS "Shop owners can delete tables" ON public.shop_tables;
CREATE POLICY "Shop owners can delete tables" 
    ON public.shop_tables FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.shops 
            WHERE shops.id = shop_tables.shop_id 
            AND shops.user_id = auth.uid()
        )
    );
