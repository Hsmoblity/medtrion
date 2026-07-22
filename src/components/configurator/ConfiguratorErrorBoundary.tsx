import React, { Component, ReactNode } from 'react';
import { PrimaryButton } from 'components/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

// Phase 3: Advanced Error Boundary for Configurator Components
class ConfiguratorErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ConfiguratorErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, index) => prevProps.resetKeys?.[index] !== resetKey
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    // Clear any pending reset timeout
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
  };

  handleRetry = () => {
    // Add a small delay to prevent rapid retries
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 100);
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="configurator-error-boundary bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-start space-x-4">
            {/* Error Icon */}
            <div className="flex-shrink-0">
              <svg 
                className="h-8 w-8 text-red-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>

            {/* Error Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Something went wrong with the configurator
              </h3>
              
              <p className="text-sm text-red-700 mb-4">
                We encountered an unexpected error while loading the configurator. 
                This might be due to a temporary issue with the product data or network connection.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mb-4">
                  <summary className="text-sm font-medium text-red-800 cursor-pointer hover:text-red-900">
                    Technical Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">{errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <PrimaryButton
                  onClick={this.handleRetry}
                  size="sm"
                  className="bg-[#f7a236] hover:bg-[#3fa2a3] text-white rounded-[35px] px-6 py-3 focus:ring-[#3fa2a3]"
                >
                  Try Again
                </PrimaryButton>
                
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Reload Page
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Go Back
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-4 text-xs text-red-600">
                <p>
                  If this problem persists, please try refreshing the page or contact support. 
                  Error ID: {this.state.eventId}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ConfiguratorErrorBoundary;