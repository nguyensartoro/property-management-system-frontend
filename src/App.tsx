import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Router from './Router'
import { useAuthStore } from './stores/authStore'

function App() {
  const { checkAuth } = useAuthStore();
  
  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Router />
    </BrowserRouter>
  )
}

export default App