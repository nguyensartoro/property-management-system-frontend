import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 mb-6">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6 text-left">
          <h3 className="text-md font-medium text-blue-800 mb-2">Login Information</h3>
          <p className="text-sm text-blue-700">
            You can use the following test credentials:
          </p>
          <div className="mt-2 bg-white p-3 rounded border border-blue-100 font-mono text-sm">
            <div><span className="text-gray-500">Email:</span> admin@example.com</div>
            <div><span className="text-gray-500">Password:</span> Admin@123</div>
          </div>
        </div>
        
        <Link 
          to="/" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 