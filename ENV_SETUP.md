# Environment Variables Setup

To use Twitter authentication with NextAuth.js, you need to set up the following environment variables.

## Required Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-a-random-string

# Twitter OAuth 2.0 Credentials
# Get these from https://developer.twitter.com/en/apps
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
```

## How to Get Twitter OAuth Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/apps)
2. Create a new app or use an existing one
3. Navigate to the "Keys and tokens" section
4. Under "OAuth 2.0 Client ID and Client Secret", you'll find:
   - **Client ID** → Use this for `TWITTER_CLIENT_ID`
   - **Client Secret** → Use this for `TWITTER_CLIENT_SECRET`

## Generate NEXTAUTH_SECRET

You can generate a random secret using:

```bash
openssl rand -base64 32
```

Or use any online random string generator (at least 32 characters recommended).

## Update NEXTAUTH_URL for Production

When deploying to production, update `NEXTAUTH_URL` to your production domain:

```env
NEXTAUTH_URL=https://yourdomain.com
```

## Twitter App Settings

Make sure your Twitter app has the following settings:

1. **Callback URL**: Add `http://localhost:3000/api/auth/callback/twitter` for development
2. **App permissions**: Enable "Read" permissions (or higher if needed)
3. **OAuth 2.0**: Make sure OAuth 2.0 is enabled for your app

## Notes

- Never commit `.env.local` to version control
- The `.env.local` file is already in `.gitignore`
- For production, set these variables in your hosting platform's environment variable settings

