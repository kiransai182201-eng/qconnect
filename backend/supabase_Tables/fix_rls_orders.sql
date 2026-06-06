DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
CREATE POLICY "Anyone can view orders" 
    ON public.orders FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
CREATE POLICY "Anyone can view order items" 
    ON public.order_items FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items" 
    ON public.order_items FOR INSERT 
    WITH CHECK (true);
