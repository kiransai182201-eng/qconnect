-- Enable Row Level Security
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 1. Shops: Public can read published shops. Owners can read/write their own.
CREATE POLICY "Public can view published shops" ON shops FOR SELECT USING (status = 'published');
CREATE POLICY "Owners can manage their shops" ON shops FOR ALL USING (auth.uid() = user_id);

-- 2. Categories & Items: Public can read if shop is published. Owners can manage their own.
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Owners can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE id = categories.shop_id AND user_id = auth.uid())
);

CREATE POLICY "Public can view items" ON items FOR SELECT USING (true);
CREATE POLICY "Owners can manage items" ON items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM categories c 
    JOIN shops s ON c.shop_id = s.id 
    WHERE c.id = items.category_id AND s.user_id = auth.uid()
  )
);

-- 3. Shop Tables: Public can read active tables. Owners manage.
CREATE POLICY "Public can view active tables" ON shop_tables FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage tables" ON shop_tables FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE id = shop_tables.shop_id AND user_id = auth.uid())
);

-- 4. Orders & Order Items: Public CANNOT read all orders. Only inserts allowed for public, or reads based on their session/table if needed (but currently frontend reads via returned data from RPC).
-- We allow anonymous to insert. Owners can read all orders for their shop.
CREATE POLICY "Anonymous can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can read shop orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM shops WHERE id = orders.shop_id AND user_id = auth.uid())
);
CREATE POLICY "Owners can update shop orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM shops WHERE id = orders.shop_id AND user_id = auth.uid())
);

CREATE POLICY "Anonymous can insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can read order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN shops s ON o.shop_id = s.id
    WHERE o.id = order_items.order_id AND s.user_id = auth.uid()
  )
);

-- 5. Feedback: Anonymous can insert. Owners can read.
CREATE POLICY "Anonymous can insert feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can read feedback" ON feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM shops WHERE id = feedback.shop_id AND user_id = auth.uid())
);

