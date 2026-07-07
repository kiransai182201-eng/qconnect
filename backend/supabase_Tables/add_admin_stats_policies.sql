-- SQL: Grant admins permission to read orders and menu_views for global analytics

-- Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all menu_views" ON public.menu_views;

-- Create policies
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all menu_views" ON public.menu_views
  FOR SELECT USING (is_admin());
