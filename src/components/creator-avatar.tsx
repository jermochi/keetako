import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { initialsOf } from '@/lib/format';

type Props = {
  /** Empty renders the "@" placeholder — the form's live preview before typing. */
  handle: string;
  size?: number;
};

/**
 * Ringed circular avatar for the creator screens — the social-app read.
 *
 * The ring is heat→heat.bright, never a second hue: it's the same accent at two
 * luminances, so it reads as depth rather than as a new colour with a meaning
 * of its own. (`InitialsAvatar` is the squared-off tile used where a creator is
 * context inside another record — thread rows. Different job, different shape.)
 */
export function CreatorAvatar({ handle, size = 52 }: Props) {
  const theme = useTheme();
  const initials = handle ? initialsOf(handle) : '@';

  // Ring and the ground-coloured gap that separates it from the disc, both
  // proportional so 52 / 72 / 88 keep the same optical weight.
  const ring = size >= 80 ? 2.5 : 2;
  const inner = size - ring * 4;

  return (
    <LinearGradient
      colors={[theme.heat.main, theme.heat.bright]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.ring, { width: size, height: size, borderRadius: size / 2, padding: ring }]}>
      <View
        style={[
          styles.gap,
          { borderRadius: (size - ring * 2) / 2, backgroundColor: theme.bg, padding: ring },
        ]}>
        <View
          style={[
            styles.disc,
            { borderRadius: inner / 2, backgroundColor: theme.hairStrong },
          ]}>
          <Text
            style={[
              styles.initials,
              { color: handle ? theme.ink : theme.inkSecondary, fontSize: size * 0.3 },
            ]}>
            {initials}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  ring: { flexShrink: 0 },
  gap: { flex: 1 },
  disc: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '600' },
});
