import React from 'react'

const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center py-16">
          <i className="material-icons-round text-4xl text-gray-400 mb-4">settings</i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings Page Coming Soon</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            This page will allow you to manage your account settings, profile information, and system preferences.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage 