/* global process */
import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
import path from 'path';

let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim();
          if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
          if (key === 'VITE_SUPABASE_ANON_KEY') supabaseKey = val;
        }
      });
    }
  } catch (err) {
    console.warn("Could not read .env file:", err.message);
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in process.env or a local .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('=== STARTING SUPABASE DATABASE RLS SECURITY TESTS ===\n');

  // Test 1: Try to select all shops (Anons should only see published shops)
  console.log('Test 1: Querying all shops anonymously...');
  const { data: shops, error: shopsErr } = await supabase.from('shops').select('id, name, status, owner_unique_id');
  if (shopsErr) {
    console.error('❌ Shops query failed:', shopsErr.message);
  } else {
    console.log(`✅ Shops query succeeded. Found ${shops.length} shops.`);
    console.log('Shops returned:', shops);
    const hasUnpublished = shops.some(s => s.status !== 'published');
    if (hasUnpublished) {
      console.error('⚠️ SECURITY FLUSH: Found draft/unpublished shops in the result!');
    } else {
      console.log('🔒 SECURITY PASS: No draft/unpublished shops were returned.');
    }
  }
  console.log('\n-----------------------------------------------\n');

  // Test 2: Try to select all orders (Anons should not be able to list all orders)
  console.log('Test 2: Querying all orders anonymously...');
  const { data: orders, error: ordersErr } = await supabase.from('orders').select('*');
  if (ordersErr) {
    console.error('❌ Orders query failed:', ordersErr.message);
  } else {
    console.log(`✅ Orders query succeeded. Found ${orders.length} orders.`);
    if (orders.length > 0) {
      console.log('Sample order details returned:', orders.slice(0, 2));
      console.warn('⚠️ SECURITY WARNING: Anonymous users can fetch/list multiple orders from the database.');
    } else {
      console.log('🔒 SECURITY PASS: No orders returned (access restricted).');
    }
  }
  console.log('\n-----------------------------------------------\n');

  // Test 3: Try to select all order items
  console.log('Test 3: Querying all order items anonymously...');
  const { data: orderItems, error: itemsErr } = await supabase.from('order_items').select('*');
  if (itemsErr) {
    console.error('❌ Order items query failed:', itemsErr.message);
  } else {
    console.log(`✅ Order items query succeeded. Found ${orderItems.length} items.`);
    if (orderItems.length > 0) {
      console.warn('⚠️ SECURITY WARNING: Anonymous users can fetch/list all order items.');
    } else {
      console.log('🔒 SECURITY PASS: No order items returned (access restricted).');
    }
  }
  console.log('\n================ TESTS COMPLETED ================\n');
}

runTests().catch(console.error);
