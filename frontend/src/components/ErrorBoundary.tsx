import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorId: Date.now().toString(36)
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };
    
    if (import.meta.env.PROD) {
      console.log('Error reported:', errorReport);
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-app-bg p-4">
          <div className="max-w-md w-full text-center app-surface rounded-3xl p-8 border border-app-border shadow-app-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-text-secondary mb-6">
              We're sorry for the inconvenience. The error has been reported.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={this.handleRetry}
                className="w-full btn-gradient py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-app-bg hover:bg-app-border text-text-primary py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>
            
            {this.state.errorId && (
              <p className="text-xs text-text-muted mt-4">
                Error ID: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
