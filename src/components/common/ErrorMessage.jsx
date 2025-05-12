import { AlertCircle, RefreshCw, X } from "lucide-react";

const ErrorMessage = ({ message, onRetry, onDismiss }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] p-4">
      <div className="flex flex-col items-center max-w-md p-6 bg-light rounded-lg shadow-md">
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-red-100">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>

        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Something went wrong
        </h3>

        <p className="mb-4 text-sm text-gray-500 text-center">{message}</p>

        <div className="flex items-center space-x-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <X className="w-4 h-4 mr-2" />
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
