import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zpqmlpbtzllnnmovwrnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcW1scGJ0emxsbm5tb3Z3cm5mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc4OTEwNCwiZXhwIjoyMDk2MzY1MTA0fQ.VCEibK5KF8AlHT0V38trASDeVRbcJkH_ivpX4tS6THo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying all shops with service role...');
  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('*');

  if (shopsError) {
    console.error('Query failed:', shopsError.message);
    return;
  }

  console.log('Found shops:', shops.length);
  shops.forEach(s => {
    console.log(`ID: ${s.id}, Name: ${s.name}, Status: ${s.status}, Unique ID: ${s.owner_unique_id}`);
  });
}

run();
