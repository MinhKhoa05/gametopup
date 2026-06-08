import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClientRestore, persistQueryClientSubscribe } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { Button } from '@/components/ui';
import { queryClient } from './lib/queryClient';
import './styles/globals.css';
import './styles/topup.css';
import './styles/theme.css';
import './styles/ui.css';

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
});

const persistOptions = {
  persister,
  maxAge: 1000 * 60 * 60 * 24,
  dehydrateOptions: {
    shouldDehydrateQuery: (query: { meta?: { persist?: boolean } }) => query.meta?.persist === true,
  },
};

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
        <div className="min-h-screen bg-ink px-6 py-8 text-slate-100">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center">
            <div className="w-full rounded-3xl border border-white/10 bg-ink-light p-6 shadow-glow sm:p-8">
              <p className="gt-eyebrow">System error</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {'Ứng dụng đã gặp lỗi khi khởi tạo'}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                {'Trang không thể tiếp tục vì có lỗi không mong muốn trong quá trình khởi tạo giao diện.'}
              </p>
              <pre className="mt-5 overflow-auto rounded-2xl border border-rose-400/20 bg-black/20 p-4 text-sm leading-6 text-rose-200">
                {this.state.error.message}
              </pre>
              <Button type="button" variant="accent" className="mt-6" onClick={() => window.location.reload()}>
                {'Tải lại trang'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

async function bootstrap() {
  await persistQueryClientRestore({
    queryClient,
    ...persistOptions,
  });

  persistQueryClientSubscribe({
    queryClient,
    ...persistOptions,
  });

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}

void bootstrap();
