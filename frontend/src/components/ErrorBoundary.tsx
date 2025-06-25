import React from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark flex items-center justify-center transition-colors duration-300">Something went wrong.</div>;
    return this.props.children;
  }
}
