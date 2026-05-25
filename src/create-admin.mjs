// Creates an admin user in Supabase Auth.
// Usage: node src/create-admin.mjs
// Then sign in at /admin/login with these credentials.

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'https://kwvlbxuoxudjxskyicue.supabase.co';
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3dmxieHVveHVkanhza3lpY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTMwNTgsImV4cCI6MjA5NTI4OTA1OH0.dSly3eXp9b3GDXe3tb4GQF2b_BKQZU6xCocHy23PQWY';

const email = 'admin@anfalwatches.com';
const password = 'Admin123!';

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { role: 'admin' },
  },
});

if (error) {
  if (error.message.includes('already registered')) {
    console.log('✓ Admin already exists. Try signing in with:');
  } else {
    console.error('✗ Failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('✓ Admin user created successfully!');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Email:    admin@anfalwatches.com');
console.log('  Password: Admin123!');
console.log('  Sign in:  http://localhost:4321/admin/login');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (data?.user?.identities?.length === 0) {
  console.log('\n⚠ Email confirmation is required. Check the admin\'s inbox or');
  console.log('  disable email confirmation in Supabase Dashboard:');
  console.log('  Authentication → Settings → Confirm email (disable)');
}
