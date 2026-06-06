-- PRODUCTION HARDENING AND SECURITY UPGRADES FOR QCONNECT PLATFORM

-- 1. Hardened RLS Policy for Orders Insertion (Anonymous Customers)
-- Prevents status/payment_status tampering, forces initial state to 'pending'
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (
        status = 'pending'
        AND payment_status = 'pending'
        AND EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = orders.shop_id
            AND shops.status = 'published'
        )
        AND (
            table_id IS NULL OR EXISTS (
                SELECT 1 FROM public.shop_tables
                WHERE shop_tables.id = orders.table_id
                AND shop_tables.shop_id = orders.shop_id
                AND shop_tables.is_active = true
            )
        )
    );

-- 2. Hardened RLS Policy for Order Items Insertion
-- Prevents inserting items for non-existent or already processed/delivered orders
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.status = 'pending'
        )
    );

-- 3. Hardened RLS Policy for Notifications Insertion
-- Prevents notification spam across shops; only allows inserting notifications for published shops
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Anyone can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = notifications.shop_id
            AND shops.status = 'published'
        )
    );

-- 4. PostgreSQL Trigger to Prevent Order Item Price Tampering
-- Auto-fills price_at_time using the master items price, ignoring any client-supplied manipulated price
CREATE OR REPLACE FUNCTION public.verify_and_set_item_price()
RETURNS TRIGGER AS $$
BEGIN
    SELECT price INTO NEW.price_at_time 
    FROM public.items 
    WHERE id = NEW.item_id;
    
    IF NEW.price_at_time IS NULL THEN
        RAISE EXCEPTION 'Item does not exist in menu';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enforce_item_price ON public.order_items;
CREATE TRIGGER enforce_item_price
BEFORE INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.verify_and_set_item_price();

-- 5. Missing Database Indexes for Query and Join Performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON public.orders(table_id);
CREATE INDEX IF NOT EXISTS idx_feedback_shop_id ON public.feedback(shop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_shop_id ON public.notifications(shop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
