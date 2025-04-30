import React from 'react';
import { useToast } from './toast';

const ToastExample: React.FC = () => {
  const { addToast } = useToast();

  const showSuccessToast = () => {
    addToast({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully',
      duration: 5000
    });
  };

  const showErrorToast = () => {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Something went wrong. Please try again.',
      duration: 5000
    });
  };

  const showWarningToast = () => {
    addToast({
      type: 'warning',
      title: 'Warning',
      message: 'This action cannot be undone',
      duration: 5000
    });
  };

  const showInfoToast = () => {
    addToast({
      type: 'info',
      title: 'Information',
      message: 'Your changes have been saved',
      duration: 5000
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Toast Notification Examples</h2>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={showSuccessToast}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Show Success Toast
        </button>
        
        <button
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Show Error Toast
        </button>
        
        <button
          onClick={showWarningToast}
          className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
        >
          Show Warning Toast
        </button>
        
        <button
          onClick={showInfoToast}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Show Info Toast
        </button>
      </div>
    </div>
  );
};

export default ToastExample; 