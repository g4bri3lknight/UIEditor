"use client";

import React, { Component, ReactNode } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    logger.error(
      `ErrorBoundary caught: ${error.message}`,
      error,
      "ErrorBoundary",
      errorInfo.componentStack
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-screen flex items-center justify-center bg-destructive/10">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive mb-2">Errore</h1>
              <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Ricarica pagina
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
