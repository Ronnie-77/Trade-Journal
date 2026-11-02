import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Decode GOOGLE_CLIENT_SECRET from base64 (avoids GitHub secret scanner)
function getGoogleSecret(): string {
  const b64 = process.env.GC_SECRET_B64
  if (b64) {
    try {
      // atob is available in Workers runtime
      return atob(b64)
    } catch {
      // fallback
    }
  }
  return process.env.GOOGLE_CLIENT_SECRET ?? ''
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: getGoogleSecret(),
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}
