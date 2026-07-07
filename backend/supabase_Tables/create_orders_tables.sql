-- 1. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT NOT NULL,
    table_number TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'preparing', 'ready', 'delivered', 'rejected'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES public.items(id) ON DELETE SET NULL, -- if item is deleted, keep order history but set item_id to null
    item_name TEXT NOT NULL, -- Snapshot of item name at time of order
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4. Policies for orders
DROP POLICY IF EXISTS "Users can view their shop orders" ON public.orders;
CREATE POLICY "Users can view their shop orders" 
    ON public.orders FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.shops 
            WHERE shops.id = orders.shop_id 
            AND shops.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their shop orders" ON public.orders;
CREATE POLICY "Users can update their shop orders" 
    ON public.orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.shops 
            WHERE shops.id = orders.shop_id 
            AND shops.user_id = auth.uid()
        )
    );

-- Allow public to INSERT orders (customers scanning QR code)
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

-- 5. Policies for order_items
DROP POLICY IF EXISTS "Users can view their shop order items" ON public.order_items;
CREATE POLICY "Users can view their shop order items" 
    ON public.order_items FOR SELECT 
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

DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items" 
    ON public.order_items FOR INSERT 
    WITH CHECK (true);

-- 6. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 7. Generate a Sample Order (Anonymous DO block)
DO $$
DECLARE
    v_shop_id UUID;
    v_cat_id UUID;
    v_item1_id UUID;
    v_item2_id UUID;
    v_order_id UUID;
BEGIN
    -- Get the first shop
    SELECT id INTO v_shop_id FROM public.shops LIMIT 1;
    
    IF v_shop_id IS NOT NULL THEN
        -- Create a mock category if we need to make dummy items
        SELECT id INTO v_cat_id FROM public.categories WHERE shop_id = v_shop_id LIMIT 1;
        IF v_cat_id IS NULL THEN
            INSERT INTO public.categories (shop_id, name) VALUES (v_shop_id, 'Sample Category') RETURNING id INTO v_cat_id;
        END IF;

        -- Create Dummy Items
        INSERT INTO public.items (category_id, name, description, price, is_available) 
        VALUES (v_cat_id, 'Chicken Burger', 'Classic Crispy', 180, true) 
        RETURNING id INTO v_item1_id;

        INSERT INTO public.items (category_id, name, description, price, is_available) 
        VALUES (v_cat_id, 'Coke + Fries', 'Combo Add-on', 120, true) 
        RETURNING id INTO v_item2_id;

        -- Create Sample Order
        INSERT INTO public.orders (shop_id, order_number, table_number, total_amount, status, notes)
        VALUES (v_shop_id, 'ORD-2045', '04', 480.00, 'pending', 'Extra spicy please. No onions.')
        RETURNING id INTO v_order_id;

        -- Create Sample Order Items
        INSERT INTO public.order_items (order_id, item_id, item_name, quantity, price_at_time)
        VALUES (v_order_id, v_item1_id, 'Chicken Burger', 2, 180.00);

        INSERT INTO public.order_items (order_id, item_id, item_name, quantity, price_at_time)
        VALUES (v_order_id, v_item2_id, 'Coke + Fries', 1, 120.00);

    END IF;
END $$;
