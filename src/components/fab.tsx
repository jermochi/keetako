import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { floating, radius, space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { label: string; a11yLabel: string; onPress: () => void };

/**
 * The board's one floating action. Extended (icon + label) because it's the
 * screen's primary verb, and heat because heat means "act here".
 */
export function Fab({ label, a11yLabel, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        floating,
        { backgroundColor: theme.heat.main, shadowColor: theme.heat.main },
        pressed && styles.pressed,
      ]}>
      <Feather name="plus" size={20} color={theme.heat.on} />
      <Text style={[styles.label, { color: theme.heat.on }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: space.lg,
    bottom: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 52,
    paddingHorizontal: space.lg,
    borderRadius: radius.button,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  label: { fontSize: 15, fontWeight: '700' },
});
