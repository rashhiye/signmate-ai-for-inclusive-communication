import React, { Component, type ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0b0e] text-[#e0e0e0] flex items-center justify-center p-6 font-['Montserrat',sans-serif]">
          <div className="max-w-md w-full bg-[#14161d] border border-rose-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Something Went Wrong</h1>
            <p className="text-xs text-[#a0a5b2] leading-relaxed">
              An unexpected error occurred while rendering this view.
            </p>
            {this.state.error && (
              <pre className="p-3 bg-black/60 border border-white/5 rounded-xl text-[11px] text-rose-300 font-mono text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-surface-200 text-black text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Application
              </button>
              <a
                href="/"
                className="px-4 py-2.5 rounded-xl bg-[#22242c] hover:bg-[#2d303b] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                Return to Landing
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
