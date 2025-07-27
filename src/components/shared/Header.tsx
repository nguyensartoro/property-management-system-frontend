'use client'

import { useTheme } from '@/providers/ThemeProvider'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Menu, Bell, Moon, Sun, User } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex justify-between items-center px-4 h-16">
        <div className="flex items-center md:hidden">
          <button
            className="p-2 text-gray-500 rounded-md hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex gap-4 items-center">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 rounded-md hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className="relative p-2 text-gray-500 rounded-md hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex gap-2 items-center p-2 text-gray-700 rounded-md hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <div className="flex overflow-hidden justify-center items-center w-8 h-8 bg-gray-200 rounded-full dark:bg-gray-700">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User size={16} />
                )}
              </div>
              <span className="hidden md:inline">{session?.user?.name || 'User'}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 z-10 py-1 mt-2 w-48 bg-white rounded-md border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Your Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Settings
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block px-4 py-2 w-full text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}