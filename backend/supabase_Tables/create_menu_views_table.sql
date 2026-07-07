-- Create menu_views table
CREATE TABLE IF NOT EXISTS public.menu_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.menu_views ENABLE ROW LEVEL SECURITY;

-- Policy 1: ANYONE can insert a view (anonymous customers)
CREATE POLICY "Anyone can insert menu views" 
  ON public.menu_views FOR INSERT 
  WITH CHECK (true);

-- Policy 2: ONLY the shop owner can view the stats
CREATE POLICY "Shop owners can view their menu views" 
  ON public.menu_views FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.shops WHERE id = menu_views.shop_id
    )
  );

-- To enable Supabase Realtime for this table, we need to add it to the publication
alter publication supabase_realtime add table menu_views;
