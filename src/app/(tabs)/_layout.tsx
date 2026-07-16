import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { strings } from '@/constants/strings';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Nav is a read state: active = ink, never heat. inkSecondary (not
        // inkMuted) keeps the 11px inactive labels AA-legible.
        tabBarActiveTintColor: theme.ink,
        tabBarInactiveTintColor: theme.inkSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.hair,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0, // hairline-first: no floating shadow on the bar
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabs.pipeline,
          tabBarIcon: ({ color }) => <Feather name="inbox" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="creators"
        options={{
          title: strings.tabs.creators,
          tabBarIcon: ({ color }) => <Feather name="users" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
