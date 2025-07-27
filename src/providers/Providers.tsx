'use client'

import { ThemeProvider } from '@/providers/ThemeProvider'
import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/providers/ToastProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 