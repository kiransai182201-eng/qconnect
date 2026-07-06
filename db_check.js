import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zpqmlpbtzllnnmovwrnf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcW1scGJ0emxsbm5tb3Z3cm5mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc4OTEwNCwiZXhwIjoyMDk2MzY1MTA0fQ.VCEibK5KF8AlHT0V38trASDeVRbcJkH_ivpX4tS6THo';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  console.log('--- Checking Shops (Service Role) ---');
  const { data: shops, error: shopsErr } = await supabase.from('shops').select('*');
  console.log('Shops error:', shopsErr);
  console.log('Shops count:', shops?.length);
  if (shops) {
    shops.forEach(s => console.log(`Shop: ${s.name}, ID: ${s.id}, Code: ${s.owner_unique_id}`));
  }

  console.log('--- Checking Shop Tables (Service Role) ---');
  const { data: tables, error: tablesErr } = await supabase.from('shop_tables').select('*');
  console.log('Tables error:', tablesErr);
  console.log('Tables count:', tables?.length);
  if (tables) {
    tables.forEach(t => console.log(`Table ID: ${t.id}, Table Number: ${t.table_number}, Token: ${t.table_token}, Shop ID: ${t.shop_id}`));
  }
  
  console.log('--- Checking Categories (Service Role) ---');
  const { data: categories, error: catsErr } = await supabase.from('categories').select('*');
  console.log('Categories error:', catsErr);
  console.log('Categories count:', categories?.length);
  if (categories) {
    categories.forEach(c => console.log(`Category: ${c.name}, ID: ${c.id}, Shop ID: ${c.shop_id}`));
  }
  
  console.log('--- Checking Items (Service Role) ---');
  const { data: items, error: itemsErr } = await supabase.from('items').select('*');
  console.log('Items error:', itemsErr);
  console.log('Items count:', items?.length);
}

check().catch(console.error);
