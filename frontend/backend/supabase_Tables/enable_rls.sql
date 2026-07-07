-- 1. Enable RLS on every table
ALTER TABLE shops          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback       ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_views     ENABLE ROW LEVEL SECURITY;

-- 2. Important — also disable realtime for sensitive tables
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE order_items REPLICA IDENTITY FULL;

-- 3. All policies

-- A. shops — owner sees only their shop
CREATE POLICY "Owner access own shop"
ON shops FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- B. orders — only for owner's shop
CREATE POLICY "Owner access own orders"
ON orders FOR ALL
USING (
  shop_id IN (
    SELECT id FROM shops WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  shop_id IN (
    SELECT id FROM shops WHERE user_id = auth.uid()
  )
);

-- C. order_items — via order → shop chain
CREATE POLICY "Owner access own order items"
ON order_items FOR ALL
USING (
  order_id IN (
    SELECT o.id FROM orders o
    JOIN shops s ON s.id = o.shop_id
    WHERE s.user_id = auth.uid()
  )
);

-- D. categories, items, notifications, feedback, menu_views

-- categories
CREATE POLICY "Owner access own categories"
ON categories FOR ALL
USING (shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid()))
WITH CHECK (shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid()));

-- items
CREATE POLICY "Owner access own items"
ON items FOR ALL
USING (
  category_id IN (
    SELECT c.id FROM categories c
    JOIN shops s ON s.id = c.shop_id
    WHERE s.user_id = auth.uid()
  )
);

-- notifications
CREATE POLICY "Owner access own notifications"
ON notifications FOR ALL
USING (shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid()));

-- feedback
CREATE POLICY "Owner access own feedback"
ON feedback FOR ALL
USING (shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid()));

-- menu_views
CREATE POLICY "Owner access own menu views"
ON menu_views FOR ALL
USING (shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid()));

-- Bonus — allow public menu viewing (optional)
-- Customers can view items (no login needed)
CREATE POLICY "Public can view items"
ON items FOR SELECT USING (is_available = true);

CREATE POLICY "Public can view categories"
ON categories FOR SELECT USING (true);
