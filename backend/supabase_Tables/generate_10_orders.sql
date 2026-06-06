DO $$
DECLARE
    v_shop_id UUID;
    i INT;
    t_num INT;
    amt DECIMAL;
    n_str TEXT;
BEGIN
    -- Get the first shop
    SELECT id INTO v_shop_id FROM public.shops LIMIT 1;
    
    IF v_shop_id IS NOT NULL THEN
        FOR i IN 1..10 LOOP
            -- Generate some varied data for realism
            t_num := (i % 12) + 1; -- Tables 1 to 12
            amt := 150 + (i * 45); -- Varied amounts
            
            IF (i % 3) = 0 THEN
                n_str := 'Extra spicy please!';
            ELSIF (i % 2) = 0 THEN
                n_str := 'No onions, allergies.';
            ELSE
                n_str := NULL;
            END IF;

            -- Insert the pending order
            INSERT INTO public.orders (shop_id, order_number, table_number, total_amount, status, notes)
            VALUES (
                v_shop_id, 
                'ORD-' || lpad((9000 + i)::text, 4, '0'), 
                lpad(t_num::text, 2, '0'), -- Pads table number to '01', '02', etc.
                amt, 
                'pending', 
                n_str
            );
        END LOOP;
    END IF;
END $$;
