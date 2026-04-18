import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        console.error('Device info:', {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            onLine: navigator.onLine,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });
        
        // Removed backend logging as per instruction
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    fontFamily: 'Arial, sans-serif',
                    background: '#f8f9fa'
                }}>
                    <h2>Something went wrong</h2>
                    <p>There was an error loading the page. This might be a device compatibility issue.</p>
                    <details style={{ marginTop: '20px', textAlign: 'left' }}>
                        <summary>Error details (for troubleshooting)</summary>
                        <pre style={{ 
                            background: '#f0f0f0', 
                            padding: '10px', 
                            overflow: 'auto',
                            fontSize: '12px'
                        }}>
                            {this.state.error?.toString()}
                        </pre>
                        <p><strong>Device:</strong> {navigator.userAgent}</p>
                        <p><strong>Platform:</strong> {navigator.platform}</p>
                        <p><strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}</p>
                    </details>
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#730051',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                    <br />
                    <a 
                        href="/" 
                        style={{
                            display: 'inline-block',
                            marginTop: '10px',
                            color: '#730051',
                            textDecoration: 'none'
                        }}
                    >
                        Go to Home Page
                    </a>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;