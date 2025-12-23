import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  // ensure a test table exists
  const { error: rpcError } = await supabase.rpc('noop')
  if (rpcError) {
    console.log('Connected to Supabase (noop failed as expected), continuing...')
  }

  const table = 'proofsnap_test'

  // create table manually once in SQL editor:
  // create table if not exists public.proofsnap_test (
  //   id uuid default gen_random_uuid() primary key,
  //   message text not null,
  //   created_at timestamptz default now()
  // );

  const insertRes = await supabase
    .from(table)
    .insert({ message: 'hello from bun' })
    .select()

  if (insertRes.error) {
    console.error('Insert error:', insertRes.error)
    return
  }

  console.log('Inserted row:', insertRes.data)

  const selectRes = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (selectRes.error) {
    console.error('Select error:', selectRes.error)
    return
  }

  console.log('Latest rows:', selectRes.data)
}

main().catch((e) => console.error(e))
