import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import apiService from '@/services/apiService'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          const response = await apiService.auth.login({
            email: credentials.email,
            password: credentials.password,
          })

          if (response.status === 'success' && response.data) {
            const { user, token } = response.data
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.avatar,
              token,
            }
          }

          throw new Error('Invalid email or password')
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed'
          throw new Error(errorMessage)
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.accessToken = (user as any).token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.accessToken = token.accessToken as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: import.meta.env.VITE_NEXTAUTH_SECRET || 'default-secret-key-change-in-production',
  debug: import.meta.env.MODE === 'development',
} 