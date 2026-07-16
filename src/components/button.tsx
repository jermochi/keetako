import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { radius, space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  onPress: () => void;
  /** fill = primary action; outline = quiet action */
  variant?: 'fill' | 'outline';
  /** heat = act-here / destructive; ink = neutral */
  tone?: 'heat' | 'ink';
  loading?: boolean;
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'fill',
  tone = 'heat',
  loading = false,
  disabled = false,
}: Props) {
  const theme = useTheme();
  const fill = variant === 'fill';
  const accent = tone === 'heat' ? theme.heat.main : theme.ink;
  // Filled ink inverts to the page ground; filled heat uses its paired "on" color.
  const textColor = fill ? (tone === 'heat' ? theme.heat.on : theme.bg) : accent;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        fill ? { backgroundColor: accent } : { borderWidth: 1, borderColor: theme.hairStrong },
        (pressed || disabled || loading) && styles.dimmed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    paddingVertical: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: { opacity: 0.7 },
  label: { fontSize: 16, fontWeight: '700' },
});
