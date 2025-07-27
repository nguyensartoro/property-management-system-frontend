import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const error = useRouteError() as any;
  
  const errorMessage = error?.statusText || error?.message || 'An unknown error occurred';
  const isNotFound = error?.status === 404;
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">
          {isNotFound ? '404' : 'Error'}
        </h1>
        
        <h2 className="text-2xl font-semibold mb-4">
          {isNotFound 
            ? 'Page Not Found'
            : 'Something went wrong'
          }
        </h2>
        
        <p className="text-gray-600 mb-8">
          {isNotFound
            ? "The page you're looking for doesn't exist or has been moved."
            : errorMessage
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Go Back
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 