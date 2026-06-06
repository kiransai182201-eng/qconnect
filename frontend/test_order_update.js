import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

let supabaseUrl = '';
let supabaseKey = '';

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
  console.error(err);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Querying all orders...');
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*');

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    return;
  }

  console.log('Orders found:', orders.length);
  orders.forEach(o => {
    console.log(`Order ID: ${o.id}, Number: ${o.order_number}, Status: ${o.status}`);
  });
}

test();
