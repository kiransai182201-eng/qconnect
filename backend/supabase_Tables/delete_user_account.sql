-- Function to allow a user to delete their own account permanently
-- This deletes their shop (CASCADE handles shop_tables, menu_items, orders, etc.)
-- and then removes the user from auth.users

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Delete all shops owned by this user (CASCADE deletes related data)
  DELETE FROM public.shops WHERE user_id = auth.uid();

  -- 2. Delete the user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
