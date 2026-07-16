import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = { handle: string; size?: number };

/** Mono initials tile (mockup "mono-av") — quiet ink on muted surface. */
export function InitialsAvatar({ handle, size = 40 }: Props) {
  const theme = useTheme();
  const initials =
    handle
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 2)
      .toUpperCase() || '?';

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: theme.surfaceMuted,
          borderColor: theme.hair,
        },
      ]}>
      <Text style={[styles.initials, { color: theme.ink, fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontWeight: '600' },
});
