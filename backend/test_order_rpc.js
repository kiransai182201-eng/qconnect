const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function diagnose() {
  // List all shops
  const { data: shops, error: shopErr } = await client.from('shops').select('id, name, status, owner_unique_id');
  console.log('=== SHOPS ===');
  if (shopErr) console.error('Error:', shopErr.message);
  else console.log(JSON.stringify(shops, null, 2));

  // List all categories
  const { data: cats, error: catErr } = await client.from('categories').select('id, name, shop_id');
  console.log('\n=== CATEGORIES ===');
  if (catErr) console.error('Error:', catErr.message);
  else console.log(JSON.stringify(cats, null, 2));

  // List all items (first 10)
  const { data: items, error: itemErr } = await client.from('items').select('id, name, price, category_id, is_available').limit(10);
  console.log('\n=== ITEMS (first 10) ===');
  if (itemErr) console.error('Error:', itemErr.message);
  else console.log(JSON.stringify(items, null, 2));

  // List all orders (first 5)
  const { data: orders, error: orderErr } = await client.from('orders').select('id, order_number, status, total_amount, table_number, created_at').order('created_at', { ascending: false }).limit(5);
  console.log('\n=== RECENT ORDERS (last 5) ===');
  if (orderErr) console.error('Error:', orderErr.message);
  else console.log(JSON.stringify(orders, null, 2));
  
  // Check RPC function exists
  console.log('\n=== TESTING RPC ===');
  if (items && items.length > 0 && shops && shops.length > 0) {
    // Find which shop the first item belongs to
    const cat = cats?.find(c => c.id === items[0].category_id);
    const shopId = cat?.shop_id || shops[0].id;
    
    const result = await client.rpc('place_secure_order', {
      p_shop_id: shopId,
      p_table_number: 'TEST-DIAG',
      p_table_id: null,
      p_notes: 'Diagnostic test',
      p_cart_items: [{ item_id: items[0].id, quantity: 1 }],
      p_payment_method: 'Pay After Meal'
    });
    
    if (result.error) {
      console.error('❌ RPC failed:', result.error.message);
      
      // Try without payment method
      const result2 = await client.rpc('place_secure_order', {
        p_shop_id: shopId,
        p_table_number: 'TEST-DIAG',
        p_table_id: null,
        p_notes: 'Diagnostic test (no payment)',
        p_cart_items: [{ item_id: items[0].id, quantity: 1 }]
      });
      if (result2.error) console.error('❌ RPC fallback failed:', result2.error.message);
      else console.log('✅ RPC fallback succeeded:', JSON.stringify(result2.data, null, 2));
    } else {
      console.log('✅ RPC succeeded:', JSON.stringify(result.data, null, 2));
    }
  } else {
    console.log('⚠️ Cannot test RPC - no items or shops available');
  }
}

diagnose().catch(e => console.error('Fatal:', e));
