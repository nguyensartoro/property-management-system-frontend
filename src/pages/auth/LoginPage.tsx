import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoginForm from '../../components/auth/LoginForm'
import useAuthStore from '../../store/authStore'

interface LocationState {
  from?: {
    pathname: string
  }
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  // Get the location they were trying to access before being redirected to login
  const from = (location.state as LocationState)?.from?.pathname || '/dashboard'

  // Check auth status when component mounts
  useEffect(() => {
    const verify = async () => {
      console.log('LoginPage - Verifying auth status')
      await checkAuth()
    }
    verify()
  }, [checkAuth])

  // If they're already logged in, redirect them
  useEffect(() => {
    console.log('LoginPage - Auth state updated:', { isAuthenticated, isLoading })

    if (isAuthenticated && !isLoading) {
      console.log('User is authenticated, redirecting to:', from)
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, from])

  // Show loading state if checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center py-12 min-h-screen bg-gray-50 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export default LoginPage