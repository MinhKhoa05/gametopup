import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { App } from './App';
import { queryClient } from '@/shared/api/queryClient';
import { restorePersistedQueries, subscribeToPersistedQueries } from '@/shared/api/persist';
import { bootstrapAuthSession } from '@/features/auth/server';
import './styles/globals.css';
import './styles/theme.css';
import './styles/ui.css';

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
});

async function bootstrap() {
  await restorePersistedQueries(queryClient, persister);
  subscribeToPersistedQueries(queryClient, persister);
  await bootstrapAuthSession(queryClient);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}

void bootstrap();
