import React, { useState, useEffect, useCallback, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { notification } from '../../utils/motion';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

// Custom success icon component
const SuccessIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center rounded bg-success-500 text-white">
    <Check className="w-4 h-4" />
  </div>
);

// Custom error icon component
const ErrorIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center rounded bg-danger-500 text-white">
    <X className="w-4 h-4" />
  </div>
);

const icons = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
  warning: <AlertCircle className="w-5 h-5 text-warning-400" />,
  info: <Info className="w-5 h-5 text-primary-500" />
};

const bgColors = {
  success: 'bg-success-400/10',
  error: 'bg-danger-400/10',
  warning: 'bg-warning-400/10',
  info: 'bg-primary-500/10'
};

const borderColors = {
  success: 'border-l-success-500',
  error: 'border-l-danger-400',
  warning: 'border-l-warning-400',
  info: 'border-l-primary-500'
};

const progressColors = {
  success: 'bg-success-500',
  error: 'bg-danger-400',
  warning: 'bg-warning-400',
  info: 'bg-primary-500'
};

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  type = 'info',
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    
    if (duration > 0) {
      const startTime = Date.now();
      const endTime = startTime + duration;
      
      progressInterval = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;
        const percentage = Math.max(0, (remaining / duration) * 100);
        
        setProgress(percentage);
        
        if (percentage <= 0) {
          clearInterval(progressInterval);
        }
      }, 16);
      
      timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose?.();
        }, 300);
      }, duration);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={id}
          layout
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={notification}
          className={`relative overflow-hidden p-4 w-full rounded-lg border-l-4 shadow-md ${bgColors[type]} ${borderColors[type]}`}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
              {title && <h4 className="font-medium text-secondary-900 truncate">{title}</h4>}
              {description && <p className="text-sm text-secondary-700 mt-0.5">{description}</p>}
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-secondary-400 hover:text-secondary-600 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress bar */}
          {duration > 0 && (
            <motion.div 
              className={`absolute bottom-0 left-0 h-1 ${progressColors[type]}`}
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type ToastItem = ToastProps;

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (props: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Create context with default values that are safe to use even without a provider
const defaultShowToast = () => {
  console.warn('ToastProvider not found. Please wrap your app with ToastProvider.');
};

const defaultRemoveToast = () => {};

export const ToastContext = createContext<ToastContextType>({
  toasts: [],
  showToast: defaultShowToast,
  removeToast: defaultRemoveToast
});

// Global reference to the context value - this will be set in the provider
let toastContextValue: ToastContextType | null = null;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((props: Omit<ToastProps, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prevToasts) => [...prevToasts, { id, ...props }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Update the global reference whenever the callbacks change
  const contextValue = { toasts, showToast, removeToast };
  toastContextValue = contextValue;
  
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm md:max-w-md pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2 w-full">
        {children}
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  return context;
};

// Safe version of createToast that doesn't use hooks directly
const createToast = (options: Partial<ToastProps> | string) => {
  // Use the global reference instead of calling useContext directly
  if (!toastContextValue) {
    console.error('Toast used outside ToastProvider. Please ensure your app is wrapped with ToastProvider.');
    return;
  }

  try {
    if (typeof options === 'string') {
      toastContextValue.showToast({ title: options });
    } else {
      toastContextValue.showToast(options);
    }
  } catch (error) {
    console.error('Failed to show toast:', error);
  }
};

// Add methods to the toast function
const successToast = (title: string, options?: Partial<ToastProps>) => {
  createToast({ title, type: 'success', ...options });
};

const errorToast = (title: string, options?: Partial<ToastProps>) => {
  createToast({ title, type: 'error', ...options });
};

const warningToast = (title: string, options?: Partial<ToastProps>) => {
  createToast({ title, type: 'warning', ...options });
};

const infoToast = (title: string, options?: Partial<ToastProps>) => {
  createToast({ title, type: 'info', ...options });
};

// Create the final toast object with both function and method capabilities
type ToastFunction = {
  (options: Partial<ToastProps>): void;
  success: typeof successToast;
  error: typeof errorToast;
  warning: typeof warningToast;
  info: typeof infoToast;
};

export const toast = createToast as ToastFunction;
toast.success = successToast;
toast.error = errorToast;
toast.warning = warningToast;
toast.info = infoToast;

export default Toast;