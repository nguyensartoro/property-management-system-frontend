import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import LoadingScreen from '../ui/LoadingScreen'

export const ProtectedRoute: React.FC = () => {
  const location = useLocation()
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    const verifyAuth = async () => {
      console.log('ProtectedRoute - Starting auth verification')
      try {
        await checkAuth()
        console.log('ProtectedRoute - Auth check completed, isAuthenticated:', isAuthenticated)
      } catch (error) {
        console.error('ProtectedRoute - Auth check failed:', error)
      } finally {
        setIsChecking(false)
        console.log('ProtectedRoute - Finished checking, isChecking set to false')
      }
    }
    
    verifyAuth()
  }, [checkAuth, isAuthenticated])
  
  // Show loading screen while verifying authentication
  if (isChecking || isLoading) {
    console.log('ProtectedRoute - Still loading/checking, showing loading screen')
    return <LoadingScreen />
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - User not authenticated, redirecting to login')
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // If authenticated, render the child routes
  console.log('ProtectedRoute - User authenticated, rendering protected content')
  return <Outlet />
}

export default ProtectedRoute 