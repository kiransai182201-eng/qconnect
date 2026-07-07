-- Allow ANYONE (including anonymous customers scanning the QR code) to view published shops
DROP POLICY IF EXISTS "Users can view their own shops" ON public.shops;
DROP POLICY IF EXISTS "Anyone can view shops" ON public.shops;
CREATE POLICY "Anyone can view shops" 
  ON public.shops FOR SELECT 
  USING (true);

-- Allow ANYONE to view categories
DROP POLICY IF EXISTS "Users can view categories of their shops" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" 
  ON public.categories FOR SELECT 
  USING (true);

-- Allow ANYONE to view items
DROP POLICY IF EXISTS "Users can view items of their shops" ON public.items;
DROP POLICY IF EXISTS "Anyone can view items" ON public.items;
CREATE POLICY "Anyone can view items" 
  ON public.items FOR SELECT 
  USING (true);
