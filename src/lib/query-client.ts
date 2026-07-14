import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import Storage from 'expo-sqlite/kv-store';

const CACHE_KEY = 'keetako-query-cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Serve cache first (reads render offline), refetch in the background.
      networkMode: 'offlineFirst',
      gcTime: 1000 * 60 * 60 * 24 * 7, // keep 7 days so the persister has something to restore
      staleTime: 1000 * 30,
      retry: 2,
      refetchOnReconnect: true,
    },
    mutations: {
      // Fire once optimistically; if offline, pause and resume on reconnect.
      networkMode: 'offlineFirst',
      retry: 3,
    },
  },
});

// Hand-rolled persister backed by expo-sqlite/kv-store (AsyncStorage drop-in) —
// avoids pulling in @tanstack/query-async-storage-persister (not in the dep table).
export const asyncStoragePersister: Persister = {
  persistClient: async (client) => {
    await Storage.setItem(CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const cached = await Storage.getItem(CACHE_KEY);
    return cached ? (JSON.parse(cached) as PersistedClient) : undefined;
  },
  removeClient: async () => {
    await Storage.removeItem(CACHE_KEY);
  },
};

// Feed connectivity into react-query so it pauses/resumes on Cebu mobile data.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected));
  }),
);
