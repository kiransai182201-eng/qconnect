-- Enable real-time for all relevant tables

BEGIN;

-- Drop the publication if it already exists (to reset)
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create the publication for real-time
CREATE PUBLICATION supabase_realtime;

-- Add the tables that need real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE 
  shops, 
  categories, 
  items, 
  shop_tables, 
  orders, 
  order_items, 
  notifications, 
  menu_views, 
  feedback;

COMMIT;
