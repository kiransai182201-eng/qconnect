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
  -- 1. Delete all uploaded files from storage for the user's shops
  DELETE FROM storage.objects 
  WHERE bucket_id = 'shop-logos' 
    AND name IN (
      SELECT o.name 
      FROM storage.objects o
      JOIN public.shops s ON o.name LIKE (s.id::text || '/%')
      WHERE s.user_id = auth.uid()
    );

  -- 2. Delete all shops owned by this user (CASCADE deletes related data)
  DELETE FROM public.shops WHERE user_id = auth.uid();

  -- 3. Delete the user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
