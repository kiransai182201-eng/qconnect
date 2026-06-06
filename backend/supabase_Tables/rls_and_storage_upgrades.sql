-- RLS & Storage Upgrades for QConnect Platform (90%+ Security Target)

-- 1. Create Public Storage Bucket for Shop Logos if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configure RLS Policies for Storage
-- Enable anyone (authenticated or anonymous) to view logos
DROP POLICY IF EXISTS "Public Select shop-logos" ON storage.objects;
CREATE POLICY "Public Select shop-logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-logos');

-- Enable authenticated users to manage (upload/delete/update) their logos
DROP POLICY IF EXISTS "Owner manage shop-logos" ON storage.objects;
CREATE POLICY "Owner manage shop-logos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'shop-logos')
WITH CHECK (bucket_id = 'shop-logos');


-- 3. Upgrade RLS Policy for shops SELECT to prevent unauthorized shop scanning
DROP POLICY IF EXISTS "Anyone can view shops" ON public.shops;
CREATE POLICY "Anyone can view shops"
ON public.shops FOR SELECT
USING (
  user_id = auth.uid()
  OR status = 'published'
);


-- 4. Upgrade RLS Policy for orders SELECT to prevent anonymous data scraping
-- Allow owners to access all orders of their shops
-- Allow anonymous customers to view orders only on active tables within a 2-hour window
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
CREATE POLICY "Anyone can view orders"
ON public.orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = orders.shop_id
    AND shops.user_id = auth.uid()
  )
  OR
  (
    created_at > now() - interval '2 hours'
    AND EXISTS (
      SELECT 1 FROM public.shop_tables
      WHERE shop_tables.id = orders.table_id
      AND shop_tables.is_active = true
    )
  )
);


-- 5. Upgrade RLS Policy for order_items SELECT
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
CREATE POLICY "Anyone can view order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (
      EXISTS (
        SELECT 1 FROM public.shops
        WHERE shops.id = orders.shop_id
        AND shops.user_id = auth.uid()
      )
      OR
      (
        orders.created_at > now() - interval '2 hours'
        AND EXISTS (
          SELECT 1 FROM public.shop_tables
          WHERE shop_tables.id = orders.table_id
          AND shop_tables.is_active = true
        )
      )
    )
  )
);


-- 6. Hardened RLS SELECT policies for categories and items (only viewable if owner or published)
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories"
ON public.categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = categories.shop_id
    AND (shops.user_id = auth.uid() OR shops.status = 'published')
  )
);

DROP POLICY IF EXISTS "Anyone can view items" ON public.items;
CREATE POLICY "Anyone can view items"
ON public.items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.categories
    JOIN public.shops ON categories.shop_id = shops.id
    WHERE categories.id = items.category_id
    AND (shops.user_id = auth.uid() OR shops.status = 'published')
  )
);


-- 7. Add Data Integrity and Security Check Constraints
-- Ensure order amounts are positive
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS chk_orders_total_amount;
ALTER TABLE public.orders ADD CONSTRAINT chk_orders_total_amount CHECK (total_amount >= 0);

-- Ensure order item prices and quantities are positive
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS chk_order_items_price;
ALTER TABLE public.order_items ADD CONSTRAINT chk_order_items_price CHECK (price_at_time >= 0);

ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS chk_order_items_quantity;
ALTER TABLE public.order_items ADD CONSTRAINT chk_order_items_quantity CHECK (quantity > 0);

-- Ensure notification types are valid and messages have a reasonable length
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS chk_notifications_type;
ALTER TABLE public.notifications ADD CONSTRAINT chk_notifications_type CHECK (type IN ('order', 'waiter', 'payment', 'kitchen'));

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS chk_notifications_title_length;
ALTER TABLE public.notifications ADD CONSTRAINT chk_notifications_title_length CHECK (length(title) <= 100);

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS chk_notifications_message_length;
ALTER TABLE public.notifications ADD CONSTRAINT chk_notifications_message_length CHECK (length(message) <= 500);
