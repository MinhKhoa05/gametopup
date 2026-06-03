import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/forms.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/auth.css';
import './styles/topup.css';
import './styles/account.css';
import './styles/admin.css';

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', padding: 24, color: '#fff', background: '#020617', fontFamily: 'Inter, sans-serif' }}>
          <h1 style={{ marginBottom: 12, fontSize: 24, fontWeight: 800 }}>Ứng dụng đã gặp lỗi khi khởi tạo</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#fca5a5' }}>{this.state.error.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
);
