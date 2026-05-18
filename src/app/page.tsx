'use client';

import dynamic from 'next/dynamic';
import { Component, ReactNode } from 'react';

// ── Error Boundary ──
class EditorErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Errore di caricamento
            </h2>
            <p className="text-sm text-muted-foreground">
              Si è verificato un errore durante il caricamento dell&apos;editor. Prova a ricaricare la pagina.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left p-3 bg-muted rounded-lg overflow-auto max-h-32 text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Ricarica pagina
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Loading Skeleton ──
function EditorSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar skeleton */}
      <div className="h-12 border-b bg-muted/30 flex items-center px-4 gap-3">
        <div className="w-32 h-6 bg-muted animate-pulse rounded" />
        <div className="w-px h-5 bg-border mx-1" />
        <div className="w-8 h-8 bg-muted animate-pulse rounded" />
        <div className="w-8 h-8 bg-muted animate-pulse rounded" />
        <div className="w-px h-5 bg-border mx-1" />
        <div className="w-20 h-8 bg-muted animate-pulse rounded" />
        <div className="w-20 h-8 bg-muted animate-pulse rounded" />
        <div className="flex-1" />
        <div className="w-24 h-8 bg-muted animate-pulse rounded" />
        <div className="w-8 h-8 bg-muted animate-pulse rounded" />
      </div>
      {/* Main area skeleton */}
      <div className="flex-1 flex">
        {/* Left sidebar */}
        <div className="w-64 border-r bg-muted/20 p-4 space-y-3">
          <div className="w-24 h-5 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        </div>
        {/* Canvas */}
        <div className="flex-1 bg-muted/10 p-8 flex items-center justify-center">
          <div className="w-full max-w-4xl h-96 bg-muted animate-pulse rounded-lg" />
        </div>
        {/* Right sidebar */}
        <div className="w-72 border-l bg-muted/20 p-4 space-y-3">
          <div className="w-20 h-5 bg-muted animate-pulse rounded" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="w-16 h-3 bg-muted animate-pulse rounded" />
              <div className="h-8 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Editor = dynamic(
  () => import('@/components/editor/Editor').then((m) => m.Editor),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);

export default function Home() {
  return (
    <EditorErrorBoundary>
      <Editor />
    </EditorErrorBoundary>
  );
}
