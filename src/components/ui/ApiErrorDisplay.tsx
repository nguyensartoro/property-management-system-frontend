import React from 'react';
import { AlertTriangle, RefreshCw, X, Wifi, WifiOff } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { parseApiError, isRetryableError, ApiError } from '../../utils/errorHandling';
import { useNetworkStatus } from '../../utils/networkRecovery';

interface ApiErrorDisplayProps {
  error: string | Error | ApiError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  title?: string;
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  title,
  className = "",
  showDetails = false,
  compact = false
}) => {
  const { isOnline, connectionQuality } = useNetworkStatus();

  if (!error) return null;

  // Parse the error to get standardized format
  let parsedError: ApiError;
  if (typeof error === 'string') {
    parsedError = { message: error };
  } else if (error instanceof Error) {
    parsedError = parseApiError({ response: null, message: error.message });
  } else {
    parsedError = error as ApiError;
  }

  const isNetworkError = parsedError.code === 'NETWORK_ERROR' || parsedError.status === 0;
  const canRetry = onRetry && (isRetryableError(parsedError) || isNetworkError);
  const displayTitle = title || (isNetworkError ? 'Connection Error' : 'Error');

  // Get appropriate icon and colors
  const getErrorIcon = () => {
    if (isNetworkError) {
      return isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />;
    }
    return <AlertTriangle className="h-5 w-5" />;
  };

  const getErrorColors = () => {
    if (isNetworkError) {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-400',
        title: 'text-orange-800',
        text: 'text-orange-700',
        button: 'bg-orange-100 hover:bg-orange-200 text-orange-800 focus:ring-orange-500'
      };
    }
    return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      text: 'text-red-700',
      button: 'bg-red-100 hover:bg-red-200 text-red-800 focus:ring-red-500'
    };
  };

  const colors = getErrorColors();

  if (compact) {
    return (
      <div className={`${colors.bg} ${colors.border} border rounded-md p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`${colors.icon} mr-2`}>
              {getErrorIcon()}
            </div>
            <span className={`text-sm ${colors.text}`}>
              {parsedError.message}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {canRetry && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                className={`h-6 px-2 text-xs ${colors.button}`}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${colors.bg} ${colors.border} border ${className}`}>
      <CardContent className="p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className={colors.icon}>
              {getErrorIcon()}
            </div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${colors.title}`}>
              {displayTitle}
            </h3>
            <div className={`mt-2 text-sm ${colors.text}`}>
              <p>{parsedError.message}</p>
              
              {/* Network status indicator */}
              {isNetworkError && (
                <div className="mt-2 flex items-center text-xs">
                  <div className={`mr-2 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  </div>
                  <span>
                    {isOnline 
                      ? `Connected (${connectionQuality} connection)` 
                      : 'No internet connection'
                    }
                  </span>
                </div>
              )}

              {/* Error details */}
              {showDetails && parsedError.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-medium text-xs">
                    Error Details
                  </summary>
                  <div className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded border">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(parsedError.details, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="mt-4 flex space-x-2">
              {canRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className={colors.button}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
          
          {/* Close button */}
          {onDismiss && (
            <div className="ml-auto pl-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiErrorDisplay; 