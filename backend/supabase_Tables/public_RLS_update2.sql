-- SQL script to allow public anonymous users to read published shops and their menus
-- Run this in your Supabase SQL Editor

-- 1. Allow anyone to view published shops
DROP POLICY IF EXISTS "Anyone can view published shops" ON public.shops;
CREATE POLICY "Anyone can view published shops" 
  ON public.shops FOR SELECT 
  USING (status = 'published');

-- 2. Allow anyone to view categories of published shops
DROP POLICY IF EXISTS "Anyone can view categories of published shops" ON public.categories;
CREATE POLICY "Anyone can view categories of published shops" 
  ON public.categories FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = categories.shop_id AND shops.status = 'published'
  ));

-- 3. Allow anyone to view items of published shops
DROP POLICY IF EXISTS "Anyone can view items of published shops" ON public.items;
CREATE POLICY "Anyone can view items of published shops" 
  ON public.items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.categories 
    JOIN public.shops ON categories.shop_id = shops.id
    WHERE categories.id = items.category_id AND shops.status = 'published'
  ));
