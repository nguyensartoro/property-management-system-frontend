import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  // Check auth on mount
  useEffect(() => {
    const verify = async () => {
      console.log('AuthLayout - Verifying auth status')
      await checkAuth()
    }
    verify()
  }, [checkAuth])

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
      </div>
    )
  }

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    console.log('AuthLayout - User is authenticated, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  console.log('AuthLayout - User is not authenticated, showing login form')
  return <><Outlet /></>
}

export default AuthLayout