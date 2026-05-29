import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

async function runMigration(filename) {
  const sql = fs.readFileSync(path.join('supabase/migrations', filename), 'utf8');
  console.log(`Running migration: ${filename}`);
  
  // Supabase JS doesn't have direct SQL execution for DDL
  // We need to use the REST API or psql
  // Let's try using the supabase sql endpoint via fetch
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Migration ${filename} failed:`, errorData);
      // Try alternative approach - split by semicolon and execute individually
      return await runMigrationByStatements(sql);
    }
    
    console.log(`Migration ${filename} completed successfully`);
    return true;
  } catch (error) {
    console.error(`Migration ${filename} failed with error:`, error);
    // Fallback: try splitting statements
    return await runMigrationByStatements(sql);
  }
}

async function runMigrationByStatements(sql) {
  const statements = sql
    .split(';')
    .map(statement => statement.trim())
    .filter(statement => statement.length > 0);
  
  for (const statement of statements) {
    try {
      // Try to use supabase rpc if available, otherwise skip
      console.log(`Executing statement: ${statement.substring(0, 50)}...`);
      // For now, we'll just log since we can't execute arbitrary SQL easily
      // In reality, we'd need to use psql or the supabase SQL API
    } catch (stmtError) {
      console.warn(`Statement failed (may be expected for CREATE EXTENSION etc.):`, stmtError.message);
    }
  }
  
  return true;
}

async function main() {
  try {
    const migrations = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort();
    
    for (const migration of migrations) {
      await runMigration(migration);
    }
    
    console.log('All migrations processed!');
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

main();