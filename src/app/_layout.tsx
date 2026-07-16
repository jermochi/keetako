import type { Session } from '@supabase/supabase-js';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { asyncStoragePersister, queryClient } from '@/lib/query-client';
import { supabase } from '@/lib/supabase';

// Keep the native splash up until the initial session check resolves; the root
// gates the navigator behind `loading`, so expo-router's auto-hide never fires.
SplashScreen.preventAutoHideAsync();

// Navigation containers pick these up for transition backgrounds, ripples,
// and any native chrome — otherwise stock react-navigation blue/white bleeds
// through between our token-styled screens.
const ledgerDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.dark.heat.main,
    background: colors.dark.bg,
    card: colors.dark.surface,
    text: colors.dark.ink,
    border: colors.dark.hair,
    notification: colors.dark.heat.main,
  },
};

const ledgerLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.light.heat.main,
    background: colors.light.bg,
    card: colors.light.surface,
    text: colors.light.ink,
    border: colors.light.hair,
    notification: colors.light.heat.main,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useProtectedRoute(session, loading);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
      onSuccess={() => {
        // Restored cache is in memory — retry any writes that were queued offline.
        queryClient.resumePausedMutations();
      }}>
      <ThemeProvider value={colorScheme === 'dark' ? ledgerDark : ledgerLight}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <Stack screenOptions={{ headerShown: false }} />
        )}
        <StatusBar style="auto" />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}

// Redirect between the (auth) group and the app based on session state.
function useProtectedRoute(session: Session | null, loading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, segments, loading, router]);
}
