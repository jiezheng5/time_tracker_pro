import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="flex flex-col items-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
          <p className="text-gray-600 mt-1">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
