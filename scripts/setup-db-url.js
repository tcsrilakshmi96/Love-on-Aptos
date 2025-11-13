// Script to set DATABASE_URL from SUPABASE_URL
// This extracts the project reference from SUPABASE_URL and constructs the connection string

const fs = require('fs');
const path = require('path');

// Load .env.local if it exists
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  console.error('Error: SUPABASE_URL must be set in .env.local');
  process.exit(1);
}

// Extract project reference from SUPABASE_URL
// Format: https://xxxxx.supabase.co -> xxxxx
const projectRefMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
if (!projectRefMatch) {
  console.error('Error: Invalid SUPABASE_URL format. Expected: https://xxxxx.supabase.co');
  process.exit(1);
}

const projectRef = projectRefMatch[1];

// Get database password
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
if (!dbPassword) {
  console.error('Error: SUPABASE_DB_PASSWORD must be set in .env.local');
  console.error('Get your database password from: Supabase Dashboard > Settings > Database');
  process.exit(1);
}

// Construct connection pooling URL (recommended for Prisma)
// Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
// Try common regions, user can specify SUPABASE_REGION if needed
const region = process.env.SUPABASE_REGION || 'us-east-1';
const databaseUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;

// Update .env.local
const envPath = path.join(__dirname, '../.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  
  // Remove existing DATABASE_URL if present
  envContent = envContent.replace(/^DATABASE_URL=.*$/m, '');
}

// Add or update DATABASE_URL
if (!envContent.includes('DATABASE_URL=')) {
  envContent += `\nDATABASE_URL=${databaseUrl}\n`;
} else {
  envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${databaseUrl}`);
}

fs.writeFileSync(envPath, envContent.trim() + '\n');
console.log('✅ DATABASE_URL has been set in .env.local');
console.log(`   Using connection pooling: postgres.${projectRef}@aws-0-${region}.pooler.supabase.com:6543`);
console.log('\n📝 Next steps:');
console.log('   npx prisma generate');
console.log('   npx prisma db push');

