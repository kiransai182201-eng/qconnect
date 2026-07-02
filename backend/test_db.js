const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceRole);

async function run() {
  console.log("=== Testing Supabase Realtime Subscription ===");
  
  let receivedRealtime = false;
  
  // 1. Subscribe using anon client
  const channel = anonClient.channel('test-realtime-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'registrations'
    }, (payload) => {
      console.log("🔔 REALTIME EVENT RECEIVED:", payload);
      receivedRealtime = true;
    })
    .subscribe((status) => {
      console.log("Channel subscription status:", status);
    });

  // Wait 3 seconds for subscription to complete
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log("Inserting test row to trigger Realtime...");
  const testEmail = `realtime_test_${Date.now()}@test.com`;
  
  const { data, error } = await adminClient
    .from('registrations')
    .insert([{
      shop_name: 'Realtime Test Shop',
      owner_name: 'Realtime Owner',
      email: testEmail,
      mobile: '1234567890',
      tables: 5,
      status: 'PENDING'
    }])
    .select();

  if (error) {
    console.error("Insertion failed:", error);
    process.exit(1);
  }

  console.log("Inserted test row with ID:", data[0].id);

  // Wait 5 seconds to see if Realtime event is received
  console.log("Waiting for Realtime event...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Clean up
  console.log("Cleaning up test row...");
  await adminClient.from('registrations').delete().eq('id', data[0].id);
  
  if (receivedRealtime) {
    console.log("\n✅ REALTIME IS WORKING PERFECTLY!");
  } else {
    console.log("\n❌ REALTIME WAS NOT RECEIVED. Realtime publication might not be enabled for registrations table in Supabase.");
  }
  
  process.exit(0);
}
run();
