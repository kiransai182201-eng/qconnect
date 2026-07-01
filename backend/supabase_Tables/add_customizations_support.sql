-- Migration script to add support for item customizations natively in Supabase

-- 1. Add customizations column to order_items table
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS customizations JSONB DEFAULT NULL;

-- 2. Update place_secure_order function to handle customizations.
-- If you run this migration, you can pass customizations in p_cart_items:
-- [{"item_id": "uuid", "quantity": 1, "customizations": {"spice_level": "Mild", "addons": [{"name": "Grilled Chicken", "price": 100}]}}]
CREATE OR REPLACE FUNCTION place_secure_order(
    p_shop_id UUID,
    p_table_number TEXT,
    p_table_id UUID,
    p_notes TEXT,
    p_cart_items JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_number TEXT;
    v_order_id UUID;
    v_total_amount NUMERIC := 0;
    v_item RECORD;
    v_item_price NUMERIC;
    v_addon_price NUMERIC;
    v_item_name TEXT;
    v_item_available BOOLEAN;
    v_inserted_order JSONB;
    v_unavailable_items JSONB := '[]'::JSONB;
    v_customizations JSONB;
    v_addon RECORD;
BEGIN
    -- 1. Validate availability of ALL items first
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(item_id UUID, quantity INT, customizations JSONB)
    LOOP
        SELECT price, name, is_available INTO v_item_price, v_item_name, v_item_available
        FROM items
        WHERE id = v_item.item_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Item % not found', v_item.item_id;
        END IF;

        IF v_item_available IS DISTINCT FROM TRUE THEN
            v_unavailable_items := v_unavailable_items || jsonb_build_array(
                jsonb_build_object('item_id', v_item.item_id, 'name', v_item_name)
            );
        END IF;
    END LOOP;

    -- 2. If any items are unavailable, return error response
    IF jsonb_array_length(v_unavailable_items) > 0 THEN
        RETURN jsonb_build_object(
            'error', true,
            'error_type', 'items_unavailable',
            'message', 'Some items in your cart are no longer available.',
            'unavailable_items', v_unavailable_items
        );
    END IF;

    -- 3. Generate unique order number
    v_order_number := 'ORD-' || to_char(now(), 'HH24MISS') || floor(random() * 900 + 100)::text;

    -- 4. Calculate total amount (base price + addons)
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(item_id UUID, quantity INT, customizations JSONB)
    LOOP
        SELECT price INTO v_item_price
        FROM items
        WHERE id = v_item.item_id;

        -- Sum addon prices
        v_addon_price := 0;
        IF v_item.customizations IS NOT NULL AND jsonb_typeof(v_item.customizations->'addons') = 'array' THEN
            FOR v_addon IN SELECT * FROM jsonb_to_recordset(v_item.customizations->'addons') AS a(price NUMERIC)
            LOOP
                v_addon_price := v_addon_price + COALESCE(v_addon.price, 0);
            END LOOP;
        END IF;

        v_total_amount := v_total_amount + ((v_item_price + v_addon_price) * v_item.quantity);
    END LOOP;

    -- 5. Insert the order
    INSERT INTO orders (shop_id, order_number, table_number, table_id, total_amount, status, notes)
    VALUES (p_shop_id, v_order_number, p_table_number, p_table_id, v_total_amount, 'pending', p_notes)
    RETURNING id INTO v_order_id;

    -- 6. Insert order items securely
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(item_id UUID, quantity INT, customizations JSONB)
    LOOP
        SELECT price, name INTO v_item_price, v_item_name
        FROM items
        WHERE id = v_item.item_id;

        INSERT INTO order_items (order_id, item_id, item_name, quantity, price_at_time, customizations)
        VALUES (v_order_id, v_item.item_id, v_item_name, v_item.quantity, v_item_price, v_item.customizations);
    END LOOP;

    -- 7. Return the created order info
    SELECT to_jsonb(o) INTO v_inserted_order
    FROM orders o
    WHERE id = v_order_id;

    RETURN v_inserted_order;
END;
$$;
