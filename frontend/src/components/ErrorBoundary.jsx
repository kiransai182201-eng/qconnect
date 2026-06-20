import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text-main)',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-body)'
        }}>
          <div style={{
            backgroundColor: 'rgba(201, 149, 42, 0.1)',
            color: 'var(--color-accent)',
            padding: '1.5rem',
            borderRadius: '50%',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem auto'
          }}>
            <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>Something went wrong</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', maxWidth: '400px', lineHeight: '1.6', margin: '0 auto 2rem auto' }}>
            The application encountered an unexpected error. Please refresh the page or return to safety.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{ padding: '12px 28px' }}
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 28px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                border: '1px solid var(--glass-border)',
                borderRadius: '30px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
