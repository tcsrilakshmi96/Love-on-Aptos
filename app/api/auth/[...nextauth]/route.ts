import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0", // Using OAuth 2.0
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.twitterId = account.providerAccountId;
      }
      if (profile) {
        token.username = (profile as any).data?.username;
        token.name = (profile as any).data?.name;
        token.picture = (profile as any).data?.profile_image_url;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        (session.user as any).id = token.twitterId;
        (session.user as any).username = token.username;
        (session.user as any).accessToken = token.accessToken;
        // Ensure image is set from token
        if (token.picture) {
          session.user.image = token.picture as string;
        }
        // Ensure name is set from token
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
  },
});

export const { GET, POST } = handlers;

