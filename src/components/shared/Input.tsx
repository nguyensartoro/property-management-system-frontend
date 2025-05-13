import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  icon,
  iconPosition = 'right',
  className = '',
  containerClassName = '',
  id,
  ...props
}: InputProps) => {
  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          className={`
            w-full px-4 py-2 border rounded-md
            dark:bg-gray-700 dark:border-gray-600 dark:text-white
            focus:ring-2 focus:outline-none
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-500'
            }
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        
        {icon && (
          <div 
            className={`absolute inset-y-0 flex items-center pointer-events-none
              ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'}
            `}
          >
            {icon}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helper && !error && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helper}</p>}
    </div>
  );
};

export default Input; 