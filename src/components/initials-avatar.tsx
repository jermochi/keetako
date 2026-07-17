import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { initialsOf } from '@/lib/format';

type Props = { handle: string; size?: number };

/** Mono initials tile (mockup "mono-av") — quiet ink on muted surface. */
export function InitialsAvatar({ handle, size = 40 }: Props) {
  const theme = useTheme();
  const initials = initialsOf(handle);

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
