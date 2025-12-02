'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component to catch and display errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 rounded-2xl border border-destructive/20">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              {this.state.error?.message || 'ไม่สามารถโหลดข้อมูลได้ในขณะนี้'}
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              ลองอีกครั้ง
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Simple error display component for inline errors
 */
export function ErrorDisplay({
  error,
  onRetry,
  className = '',
}: {
  error: string | Error;
  onRetry?: () => void;
  className?: string;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20 ${className}`}>
      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive flex-1">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-destructive hover:text-destructive/80 underline"
        >
          ลองอีกครั้ง
        </button>
      )}
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({
  message = 'ไม่พบข้อมูล',
  icon,
  className = '',
}: {
  message?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
      {icon || <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />}
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );
}
