"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class HydrationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a hydration error
    const isHydrationError = error.message.includes('Hydration') || 
                           error.message.includes('hydration') ||
                           error.message.includes('Expected server HTML') ||
                           error.message.includes('Text content does not match');
    
    if (isHydrationError) {
      console.warn('Hydration error caught by boundary:', error.message);
      return { hasError: true, error };
    }
    
    // Re-throw non-hydration errors
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log hydration errors for debugging
    if (this.state.hasError) {
      console.error('Hydration Error Details:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI for hydration errors
      return this.props.fallback || (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Content Loading Issue
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                There was a temporary issue loading this content. Please refresh the page if the problem persists.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HydrationErrorBoundary;