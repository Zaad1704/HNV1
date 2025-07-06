import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './components/common/AccessibilityProvider';
import { ToastProvider } from './components/common/Toast';
import ErrorBoundary from './components/ErrorBoundary';

function TestApp() {
  return (
    <AccessibilityProvider>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            <div className="p-8">
              <h1 className="text-2xl font-bold">Test App - No Crash</h1>
              <p>If you see this, the basic providers work.</p>
            </div>
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}

export default TestApp;