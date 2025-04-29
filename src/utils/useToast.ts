import toast from 'react-hot-toast';

// Define options type for convenience
type ToastOptions = {
  description?: string;
  duration?: number;
};

/**
 * Custom hook for using toast notifications with react-hot-toast
 * 
 * Usage example:
 * ```
 * import { useToastHook } from '../utils/useToast';
 * 
 * const MyComponent = () => {
 *   const toast = useToastHook();
 *   
 *   const handleClick = () => {
 *     toast.success('Operation completed successfully', {
 *       description: 'Your data has been saved.'
 *     });
 *   };
 *   
 *   return <button onClick={handleClick}>Save</button>;
 * };
 * ```
 */
export const useToastHook = () => {
  // Success toast notification
  const success = (title: string, options?: ToastOptions) => {
    const content = options?.description
      ? `${title}\n${options.description}`
      : title;
    
    return toast.success(content, {
      duration: options?.duration || 5000,
      className: 'bg-success-400/10 border-l-4 border-l-success-500',
      style: {
        padding: '16px',
      },
      icon: '✅',
    });
  };
  
  // Error toast notification
  const error = (title: string, options?: ToastOptions) => {
    const content = options?.description
      ? `${title}\n${options.description}`
      : title;
    
    return toast.error(content, {
      duration: options?.duration || 5000,
      className: 'bg-danger-400/10 border-l-4 border-l-danger-400',
      style: {
        padding: '16px',
      },
      icon: '❌',
    });
  };
  
  // Warning toast notification
  const warning = (title: string, options?: ToastOptions) => {
    const content = options?.description
      ? `${title}\n${options.description}`
      : title;
    
    return toast(content, {
      duration: options?.duration || 5000,
      className: 'bg-warning-400/10 border-l-4 border-l-warning-400',
      style: {
        padding: '16px',
      },
      icon: '⚠️',
    });
  };
  
  // Info toast notification
  const info = (title: string, options?: ToastOptions) => {
    const content = options?.description
      ? `${title}\n${options.description}`
      : title;
    
    return toast(content, {
      duration: options?.duration || 5000,
      className: 'bg-primary-500/10 border-l-4 border-l-primary-500',
      style: {
        padding: '16px',
      },
      icon: 'ℹ️',
    });
  };
  
  // General toast display function
  const show = (options: { title: string; type?: 'success' | 'error' | 'warning' | 'info'; description?: string; duration?: number }) => {
    const { title, type = 'info', ...rest } = options;
    
    switch (type) {
      case 'success':
        return success(title, rest);
      case 'error':
        return error(title, rest);
      case 'warning':
        return warning(title, rest);
      case 'info':
      default:
        return info(title, rest);
    }
  };
  
  // Return all toast methods
  return {
    show,
    success,
    error,
    warning,
    info,
    dismiss: toast.dismiss,
    // Also expose the raw toast function for advanced usage
    toast
  };
};

export default useToastHook; 