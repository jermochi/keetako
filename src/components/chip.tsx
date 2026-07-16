import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { label: string; selected: boolean; onPress: () => void };

/** Status is form, not hue: selected = filled ink pill, unselected = outline. */
export function Chip({ label, selected, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        selected
          ? { backgroundColor: theme.ink, borderColor: theme.ink }
          : { borderColor: theme.hairStrong },
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      <Text style={[styles.label, { color: selected ? theme.bg : theme.inkSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.input,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  pressed: { opacity: 0.7 },
  label: { fontSize: 13, fontWeight: '600' },
});
