import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcqgfjipygvnpgejotfd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcWdmamlweWd2bnBnZWpvdGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NTAwMTAsImV4cCI6MjA5NjIyNjAxMH0.q3xfkhMs5kLn3Zm7dwG-e3itcSGrr4Y6h-9l8TWq7wc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
  console.log('=== DATABASE DATA INSPECTION ===');
  
  const { data: shops } = await supabase.from('shops').select('*');
  console.log('\n--- Shops ---');
  console.log(shops);
  
  if (shops && shops.length > 0) {
    const shopIds = shops.map(s => s.id);
    
    const { data: categories } = await supabase.from('categories').select('*').in('shop_id', shopIds);
    console.log('\n--- Categories ---');
    console.log(categories);
    
    const { data: items } = await supabase.from('items').select('*');
    console.log('\n--- Items ---');
    console.log(items);
    
    const { data: tables } = await supabase.from('shop_tables').select('*').in('shop_id', shopIds);
    console.log('\n--- Shop Tables ---');
    console.log(tables);
  }
}

inspectData().catch(console.error);
