import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback; receives the error and a reset function. */
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook your error reporting service (Sentry, ...) here.
    this.props.onError?.(error, info);
    if (import.meta.env.DEV) console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      return this.props.fallback ? (
        this.props.fallback({ error, reset: this.reset })
      ) : (
        <ErrorFallback error={error} onReset={this.reset} />
      );
    }
    return this.props.children;
  }
}
