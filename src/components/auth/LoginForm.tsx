'use client'

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import ApiErrorDisplay from '../ui/ApiErrorDisplay'
import LoginDebugger from './LoginDebugger'
import QuickLogin from './QuickLogin'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

export const LoginForm: React.FC = () => {
  const { login, isLoading, error: authError } = useAuth()
  const [showConnectionError, setShowConnectionError] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    email: 'admin@example.com',
    password: 'Admin@123'
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear field error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login form submitted')
    setShowConnectionError(false)

    if (!validate()) {
      console.log('Validation failed')
      return
    }

    console.log('Calling login with:', formData)
    try {
      const result = await login(formData)
      console.log('Login result:', result ? 'success' : 'failed')

      // No need to navigate here - useAuth hook handles navigation on success
    } catch (error) {
      console.error('Login form error:', error)
      setShowConnectionError(true)
    }
  }

  // Show network error page if connection fails
  if (showConnectionError || (authError && (authError.includes('Network Error') || authError.includes('CORS')))) {
    return (
      <ApiErrorDisplay
        error={authError || 'Could not connect to the server'}
        onRetry={() => setShowConnectionError(false)}
      />
    )
  }

  return (
    <>
      <h2 className="mt-6 text-3xl font-bold tracking-tight text-center text-gray-900">
        Sign in to your account
      </h2>

      {authError && !showConnectionError && (
        <div className="relative px-4 py-3 mt-4 text-red-700 bg-red-100 rounded border border-red-400" role="alert">
          <span className="block sm:inline">{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`relative block w-full rounded-t-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={`relative block w-full rounded-b-md border ${errors.password ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex relative justify-center px-4 py-2 w-full text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm">
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </form>

      {/* Add development tools */}
      {import.meta.env.MODE === 'development' && (
        <>
          <QuickLogin />
          <LoginDebugger />
        </>
      )}
    </>
  )
}

export default LoginForm