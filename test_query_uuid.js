import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zpqmlpbtzllnnmovwrnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcW1scGJ0emxsbm5tb3Z3cm5mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc4OTEwNCwiZXhwIjoyMDk2MzY1MTA0fQ.VCEibK5KF8AlHT0V38trASDeVRbcJkH_ivpX4tS6THo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying all shop tables...');
  const { data: tables, error } = await supabase
    .from('shop_tables')
    .select('*, shops(*)');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Found tables:', tables.length);
  tables.forEach(t => {
    console.log(`Table ID: ${t.id}, Table Number: ${t.table_number}, Token: ${t.table_token}, Shop: ${t.shops?.name} (${t.shops?.owner_unique_id})`);
  });
}

run();
