'use client';

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Something went wrong
          </h2>
          <details className="text-sm text-red-600">
            <summary className="cursor-pointer hover:text-red-800">
              Error details (click to expand)
            </summary>
            <div className="mt-2 p-2 bg-white rounded border">
              <p className="font-medium">Error:</p>
              <p className="mb-2 font-mono text-xs">{this.state.error && this.state.error.toString()}</p>
              <p className="font-medium">Component Stack:</p>
              <pre className="font-mono text-xs whitespace-pre-wrap">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
