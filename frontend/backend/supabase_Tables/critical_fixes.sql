-- CRITICAL FIXES & UPGRADES FOR QCONNECT PLATFORM

-- 1. Secure Table QR Codes with UUID tokens
ALTER TABLE public.shop_tables ADD COLUMN IF NOT EXISTS table_token UUID DEFAULT gen_random_uuid() NOT NULL;

-- 2. Add Missing Indexes to optimize queries and realtime performance
CREATE INDEX IF NOT EXISTS idx_shop_tables_shop_id ON public.shop_tables(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_categories_shop_id ON public.categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON public.items(category_id);

-- 3. Upgrade Orders Schema for Stage 2 Features
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'new';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES public.shop_tables(id) ON DELETE SET NULL;

-- 4. Create Notifications Table for Waiter Calls & Kitchen Alerts
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'order', 'waiter', 'payment', 'kitchen', 'feedback'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage their notifications" ON public.notifications;
CREATE POLICY "Owners can manage their notifications"
    ON public.notifications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = notifications.shop_id
            AND shops.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Anyone can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- 5. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL, -- 'menu_change', 'qr_generated', 'shop_update'
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Owners can view their own audit logs"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = audit_logs.shop_id
            AND shops.user_id = auth.uid()
        )
    );

-- 6. Setup Secure RLS on Orders and Order Items
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Owner can do anything on their orders
DROP POLICY IF EXISTS "Users can view their shop orders" ON public.orders;
CREATE POLICY "Users can view their shop orders"
    ON public.orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = orders.shop_id
            AND shops.user_id = auth.uid()
        )
    );

-- Anonymous customer can insert orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

-- Anonymous customer can select orders if they know the order UUID
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
CREATE POLICY "Anyone can view orders"
    ON public.orders FOR SELECT
    USING (true); -- This is needed for the customer order tracker client-side

-- Owner can do anything on order items
DROP POLICY IF EXISTS "Users can view their shop order items" ON public.order_items;
CREATE POLICY "Users can view their shop order items"
    ON public.order_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND EXISTS (
                SELECT 1 FROM public.shops
                WHERE shops.id = orders.shop_id
                AND shops.user_id = auth.uid()
            )
        )
    );

-- Anonymous customer can insert order items
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

-- Anonymous customer can select order items
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
CREATE POLICY "Anyone can view order items"
    ON public.order_items FOR SELECT
    USING (true);
