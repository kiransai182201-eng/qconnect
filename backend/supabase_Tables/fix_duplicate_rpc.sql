-- SQL Fix: Drop the old overloaded place_secure_order function to resolve database signature ambiguity

DROP FUNCTION IF EXISTS public.place_secure_order(
    p_shop_id UUID,
    p_table_number TEXT,
    p_table_id UUID,
    p_notes TEXT,
    p_cart_items JSONB
);
