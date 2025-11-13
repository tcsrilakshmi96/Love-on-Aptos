# Environment Variables

Add these environment variables to your `.env.local` file:

## Required Environment Variables

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Twitter OAuth 2.0 Credentials
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Twitter API Key (for fetching user data)
TWITTER_API_KEY=your_twitter_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Supabase Database Password (for Prisma migrations)
# Get this from: Settings > Database > Database password
# Or set it when you first create your Supabase project
SUPABASE_DB_PASSWORD=your_database_password_here

# DATABASE_URL will be auto-generated from SUPABASE_URL and SUPABASE_DB_PASSWORD
# Run: node scripts/setup-db-url.js to generate it automatically
DATABASE_URL=
```

## Environment Variable Details

### TWITTER_API_KEY
- **Purpose**: API key for the Twitter API service (https://api.twitterapi.io)
- **Where to get it**: Sign up at https://twitterapi.io and get your API key
- **Usage**: Used to fetch detailed user profile data after authentication

### SUPABASE_URL
- **Purpose**: Your Supabase project URL
- **Where to get it**: 
  1. Go to your Supabase project dashboard
  2. Navigate to Settings > API
  3. Copy the "Project URL"

### SUPABASE_ANON_KEY
- **Purpose**: Your Supabase anonymous/public API key
- **Where to get it**: 
  1. Go to your Supabase project dashboard
  2. Navigate to Settings > API
  3. Copy the "anon" or "public" key under "Project API keys"

### DATABASE_URL
- **Purpose**: PostgreSQL connection string for Prisma migrations
- **Where to get it**: 
  1. Go to your Supabase project dashboard
  2. Navigate to Settings > Database
  3. Copy the "Connection string" under "Connection pooling" or "Direct connection"
  4. Replace `[YOUR-PASSWORD]` with your database password
  5. Format: `postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`

## Setup Steps

1. **Get Twitter API Key**:
   - Visit https://twitterapi.io
   - Sign up and get your API key
   - Add it as `TWITTER_API_KEY` in `.env.local`

2. **Get Supabase Credentials**:
   - Create a Supabase project at https://supabase.com
   - Go to Settings > API
   - Copy the Project URL and add it as `SUPABASE_URL` in `.env.local`
   - Copy the anon/public key and add it as `SUPABASE_ANON_KEY` in `.env.local`
   - Go to Settings > Database
   - Copy the connection string and add it as `DATABASE_URL` in `.env.local` (replace password)

3. **Setup Database URL**:
   ```bash
   # Auto-generate DATABASE_URL from SUPABASE_URL
   node scripts/setup-db-url.js
   ```

4. **Run Prisma Migrations**:
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Push schema to database (creates/updates tables)
   npx prisma db push
   
   # Or create a migration (recommended for production)
   npx prisma migrate dev --name init
   ```

## Notes

- Never commit `.env.local` to version control
- The `.env.local` file is already in `.gitignore`
- For production, set these variables in your hosting platform's environment variable settings

