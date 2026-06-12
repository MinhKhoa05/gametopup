import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClientRestore, persistQueryClientSubscribe } from '@tanstack/react-query-persist-client';
import type { QueryClient } from '@tanstack/react-query';

export function createQueryPersister() {
  return createAsyncStoragePersister({
    storage: window.localStorage,
  });
}

export async function restorePersistedQueries(queryClient: QueryClient, persister: ReturnType<typeof createQueryPersister>) {
  await persistQueryClientRestore({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60,
  });
}

export function subscribeToPersistedQueries(queryClient: QueryClient, persister: ReturnType<typeof createQueryPersister>) {
  return persistQueryClientSubscribe({
    queryClient,
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: (query: { meta?: { persist?: boolean } }) => query.meta?.persist === true,
    },
  });
}
