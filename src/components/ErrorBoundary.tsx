import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import type { FirestoreErrorInfo } from '../utils/firestoreErrors';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
  operationSummary: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    message: '',
    operationSummary: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let message = error.message || 'An unexpected error occurred.';
    let operationSummary: string | null = null;

    try {
      const parsed = JSON.parse(error.message) as Partial<FirestoreErrorInfo>;
      if (parsed && typeof parsed.error === 'string' && parsed.operationType) {
        message = parsed.error;
        operationSummary = `${parsed.operationType.toUpperCase()} · ${parsed.path ?? 'database'}`;
      }
    } catch {
      // Plain error message
    }

    return {
      hasError: true,
      message,
      operationSummary,
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application boundary caught error:', error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '', operationSummary: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F0D0C] text-[#F5EFE6] flex items-center justify-center px-5">
          <div className="max-w-md w-full bg-[#1E1A17] border border-[#322B27] rounded-2xl p-7 text-center">
            <div className="w-11 h-11 rounded-full bg-[#5C2434]/60 border border-[#9E7B4F]/40 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-5 h-5 text-[#D4AF6A]" strokeWidth={1.75} />
            </div>
            <h1 className="font-serif text-2xl font-normal text-[#F5EFE6]">
              Unable to Load Sanctuary Data
            </h1>
            {this.state.operationSummary && (
              <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                {this.state.operationSummary}
              </p>
            )}
            <p className="mt-3 text-sm text-[#BEB3A8] leading-relaxed break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 hover:bg-[#702D40] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
