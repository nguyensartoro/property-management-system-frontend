'use client'

import React, { createContext, useContext, useState } from 'react'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

// Toast interface
export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

// Toast context type
export interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

// Create context with default values
const ToastContext = createContext<ToastContextType>({
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
})

// Toast provider props
interface ToastProviderProps {
  children: React.ReactNode
}

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// Toast provider component
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  // Show a toast notification
  const showToast = (
    message: string,
    type: ToastType = 'info',
    duration = 5000
  ) => {
    const id = generateId()
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
    }
    
    setToasts((prevToasts) => [...prevToasts, newToast])

    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }
  
  // Remove a toast notification
  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }
  
  // Context value
  const contextValue = {
    toasts,
    showToast,
    removeToast,
  }
  
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast container component
const ToastContainer: React.FC<{
  toasts: Toast[]
  removeToast: (id: string) => void
}> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) {
    return null
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-md p-4 flex items-center justify-between shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-300'
              : toast.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-300'
              : toast.type === 'warning'
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-300'
              : 'bg-blue-50 text-blue-800 border border-blue-300'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-2">
              {toast.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <p>{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// Custom hook to use toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  
  return context
} 