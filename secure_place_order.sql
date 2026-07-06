-- PostgreSQL Function to place a secure order with Customizations V2
-- Prevents clients from altering the base price of items
-- Validates item availability before accepting orders

CREATE OR REPLACE FUNCTION place_secure_order(
    p_shop_id UUID,
    p_table_number TEXT,
    p_table_id UUID,
    p_notes TEXT,
    p_cart_items JSONB, -- Expected format: [{"item_id": "uuid", "quantity": 2, "customizations_price": 50, "customizations": [...]}]
    p_payment_method TEXT DEFAULT 'Pay After Meal'
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
    v_item_name TEXT;
    v_item_available BOOLEAN;
    v_inserted_order JSONB;
    v_unavailable_items JSONB := '[]'::JSONB;
BEGIN
    -- 1. Validate availability of ALL items first
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(item_id UUID, quantity INT, customizations_price NUMERIC, customizations JSONB)
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

    -- 2. Return unavailable items error
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

    -- 4. Calculate total amount
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(item_id UUID, quantity INT, customizations_price NUMERIC, customizations JSONB)
    LOOP
        SELECT price, name INTO v_item_price, v_item_name
        FROM items
        WHERE id = v_item.item_id;

        -- Ensure customizations price is not negative to prevent abuse
        IF v_item.customizations_price < 0 THEN
            RAISE EXCEPTION 'Invalid customization price for item %', v_item.item_id;
        END IF;

        v_total_amount := v_total_amount + ((v_item_price + COALESCE(v_item.customizations_price, 0)) * v_item.quantity);
    END LOOP;

    -- 5. Insert the order
    INSERT INTO orders (shop_id, order_number, table_number, table_id, total_amount, status, notes, payment_method)
    VALUES (p_shop_id, v_order_number, p_table_number, p_table_id, v_total_amount, 'pending', p_notes, p_payment_method)
    RETURNING id INTO v_order_id;

    -- 6. Insert order items securely
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(item_id UUID, quantity INT, customizations_price NUMERIC, customizations JSONB)
    LOOP
        SELECT price, name INTO v_item_price, v_item_name
        FROM items
        WHERE id = v_item.item_id;

        INSERT INTO order_items (order_id, item_id, item_name, quantity, price_at_time, customizations)
        VALUES (
            v_order_id, 
            v_item.item_id, 
            v_item_name, 
            v_item.quantity, 
            v_item_price + COALESCE(v_item.customizations_price, 0),
            COALESCE(v_item.customizations, '{}'::JSONB)
        );
    END LOOP;

    -- 7. Return the created order info
    SELECT to_jsonb(o) INTO v_inserted_order
    FROM orders o
    WHERE id = v_order_id;

    RETURN v_inserted_order;
END;
$$;
