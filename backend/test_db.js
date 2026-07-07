const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const token = 'bc68225c-06dc-4918-ba13-bd84b7929cc5';
  console.log(`=== Querying table_token: ${token} ===`);
  const { data: tableData, error: tableErr } = await anonClient
    .from('shop_tables')
    .select('*, shops(*)')
    .eq('table_token', token)
    .single();
    
  if (tableErr) {
    console.error("❌ Table token query failed:", tableErr);
  } else {
    console.log("✅ Table query succeeded! Result:");
    console.log(JSON.stringify(tableData, null, 2));
    return;
  }

  console.log(`\n=== Querying shop_id directly: ${token} ===`);
  const { data: shopData, error: shopErr } = await anonClient
    .from('shops')
    .select('*')
    .eq('id', token)
    .single();

  if (shopErr) {
    console.error("❌ Shop ID query failed:", shopErr);
  } else {
    console.log("✅ Shop ID query succeeded! Result:");
    console.log(JSON.stringify(shopData, null, 2));
  }
}
run();
