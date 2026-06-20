-- PostgreSQL Function to place a secure order
-- Prevents clients from altering the price of items

CREATE OR REPLACE FUNCTION place_secure_order(
    p_shop_id UUID,
    p_table_number TEXT,
    p_table_id UUID,
    p_notes TEXT,
    p_cart_items JSONB -- Expected format: [{"item_id": "uuid", "quantity": 2}]
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
    v_inserted_order JSONB;
BEGIN
    -- 1. Generate unique order number
    v_order_number := 'ORD-' || to_char(now(), 'HH24MISS') || floor(random() * 900 + 100)::text;

    -- 2. Validate and calculate total amount by looking up actual prices
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(item_id UUID, quantity INT)
    LOOP
        -- Fetch actual price and name from the database securely
        SELECT price, name INTO v_item_price, v_item_name
        FROM items
        WHERE id = v_item.item_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Item % not found', v_item.item_id;
        END IF;

        v_total_amount := v_total_amount + (v_item_price * v_item.quantity);
    END LOOP;

    -- 3. Insert the order
    INSERT INTO orders (shop_id, order_number, table_number, table_id, total_amount, status, notes)
    VALUES (p_shop_id, v_order_number, p_table_number, p_table_id, v_total_amount, 'pending', p_notes)
    RETURNING id INTO v_order_id;

    -- 4. Insert order items securely
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(item_id UUID, quantity INT)
    LOOP
        SELECT price, name INTO v_item_price, v_item_name
        FROM items
        WHERE id = v_item.item_id;

        INSERT INTO order_items (order_id, item_id, item_name, quantity, price_at_time)
        VALUES (v_order_id, v_item.item_id, v_item_name, v_item.quantity, v_item_price);
    END LOOP;

    -- 5. Return the created order info
    SELECT to_jsonb(o) INTO v_inserted_order
    FROM orders o
    WHERE id = v_order_id;

    RETURN v_inserted_order;
END;
$$;
