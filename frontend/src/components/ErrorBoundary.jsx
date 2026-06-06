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
          backgroundColor: '#fdfbf7',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
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
          <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Something went wrong</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem', maxWidth: '360px', lineHeight: '1.5', margin: '0 auto 1.5rem auto' }}>
            The application encountered an unexpected error. Please refresh the page or contact support if the issue persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
              fontSize: '1rem',
              transition: 'transform 0.2s'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
