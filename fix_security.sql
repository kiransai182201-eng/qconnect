-- 1. Fix the Application Crash on Non-Unique Slugs (P1)
-- Add UNIQUE constraint to owner_unique_id
ALTER TABLE shops ADD CONSTRAINT unique_owner_id UNIQUE(owner_unique_id);

-- 2. Fix Draft Shops Triggering False Errors (P1)
-- Allow public to SELECT shops so the UI can handle the 'draft' status gracefully
DROP POLICY IF EXISTS "Public can view published shops" ON shops;
CREATE POLICY "Public can view published shops" ON shops FOR SELECT USING (true);

-- 3. Fix Massive Data Leak / Order Exposure (P0)
-- Drop completely open public read access
DROP POLICY IF EXISTS "Public can view orders" ON orders;
DROP POLICY IF EXISTS "Public can view order items" ON order_items;

-- 4. Create secure RPC for customers to fetch ONLY their specific order
CREATE OR REPLACE FUNCTION get_order_details(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order JSONB;
BEGIN
    SELECT to_jsonb(o) || jsonb_build_object('order_items', 
        COALESCE((SELECT jsonb_agg(to_jsonb(oi)) FROM order_items oi WHERE oi.order_id = o.id), '[]'::jsonb)
    ) INTO v_order
    FROM orders o
    WHERE o.id = p_order_id;
    
    RETURN v_order;
END;
$$;
