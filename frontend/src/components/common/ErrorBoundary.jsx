import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CareerOS ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-6 text-center font-sans"
          style={{
            backgroundColor: 'var(--color-main-bg, #0F172A)',
            color: 'var(--color-text-main, #F8FAFC)'
          }}
        >
          <div 
            className="rounded-2xl p-8 max-w-lg w-full border shadow-2xl space-y-5"
            style={{
              backgroundColor: 'var(--color-card-bg, #1E293B)',
              borderColor: 'var(--color-card-border, #334155)'
            }}
          >
            <div 
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-amber-500 bg-amber-500/10 border border-amber-500/20 shadow-sm"
            >
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight">
                Module Encountered an Issue
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted, #94A3B8)' }}>
                CareerOS prevented an unexpected failure from crashing your workspace. Your progress and database state are safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div 
                className="p-3 rounded-xl border text-left font-mono text-[11px] overflow-x-auto"
                style={{
                  backgroundColor: 'var(--color-secondary-bg, #0F172A)',
                  borderColor: 'var(--color-card-border, #334155)',
                  color: 'var(--color-text-muted, #94A3B8)'
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReload}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reload Page
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={this.handleReset}
                className="w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-1.5" />
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;