-- Generate a sample notification and a sample order
DO $$
DECLARE
    v_shop_id UUID;
BEGIN
    -- Get the first shop
    SELECT id INTO v_shop_id FROM public.shops LIMIT 1;
    
    IF v_shop_id IS NOT NULL THEN
        -- 1. Create a Sample Notification (For the Bell Dropdown)
        INSERT INTO public.notifications (shop_id, type, title, message)
        VALUES (
            v_shop_id, 
            'feedback', 
            '⭐⭐⭐⭐⭐ Awesome Service!', 
            'A customer just left a glowing review for your cafe.'
        );

        -- 2. Create another Sample Order (For the Live Orders / Notification Page)
        INSERT INTO public.orders (shop_id, order_number, table_number, total_amount, status, notes)
        VALUES (v_shop_id, 'ORD-8899', '12', 350.00, 'pending', 'Extra ketchup please!')
        -- We won't add items here to keep the script simple, the UI will just show no items.
        -- But it will trigger the Realtime "New Order Received" banner!
        ;
    END IF;
END $$;
