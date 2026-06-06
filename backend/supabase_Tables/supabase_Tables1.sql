-- Shops Table (Ignore if already exists)
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  tables INTEGER NOT NULL,
  logo_url TEXT,
  status TEXT DEFAULT 'setup',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own shops" ON public.shops;
CREATE POLICY "Users can view their own shops" 
  ON public.shops FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own shops" ON public.shops;
CREATE POLICY "Users can insert their own shops" 
  ON public.shops FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shops" ON public.shops;
CREATE POLICY "Users can update their own shops" 
  ON public.shops FOR UPDATE USING (auth.uid() = user_id);


-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'grid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view categories of their shops" ON public.categories;
CREATE POLICY "Users can view categories of their shops" 
  ON public.categories FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = categories.shop_id AND shops.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert categories to their shops" ON public.categories;
CREATE POLICY "Users can insert categories to their shops" 
  ON public.categories FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = categories.shop_id AND shops.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update categories of their shops" ON public.categories;
CREATE POLICY "Users can update categories of their shops" 
  ON public.categories FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = categories.shop_id AND shops.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete categories of their shops" ON public.categories;
CREATE POLICY "Users can delete categories of their shops" 
  ON public.categories FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = categories.shop_id AND shops.user_id = auth.uid()));


-- Items Table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view items of their shops" ON public.items;
CREATE POLICY "Users can view items of their shops" 
  ON public.items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.categories 
    JOIN public.shops ON categories.shop_id = shops.id
    WHERE categories.id = items.category_id AND shops.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert items to their shops" ON public.items;
CREATE POLICY "Users can insert items to their shops" 
  ON public.items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.categories 
    JOIN public.shops ON categories.shop_id = shops.id
    WHERE categories.id = items.category_id AND shops.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update items of their shops" ON public.items;
CREATE POLICY "Users can update items of their shops" 
  ON public.items FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.categories 
    JOIN public.shops ON categories.shop_id = shops.id
    WHERE categories.id = items.category_id AND shops.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete items of their shops" ON public.items;
CREATE POLICY "Users can delete items of their shops" 
  ON public.items FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.categories 
    JOIN public.shops ON categories.shop_id = shops.id
    WHERE categories.id = items.category_id AND shops.user_id = auth.uid()
  ));
