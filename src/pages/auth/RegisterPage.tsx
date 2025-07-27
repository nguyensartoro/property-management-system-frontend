import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RegisterForm from '../../components/auth/RegisterForm'
import useAuthStore from '../../store/authStore'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  // If they're already logged in, redirect them
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
       <><RegisterForm /></>
  )
}

export default RegisterPage