import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Segmented control — for small, fixed, mutually-exclusive sets where seeing every
 * option at once beats a picker. Selection is a raised surface, not heat: choosing
 * a platform isn't an "act here" moment, so it stays ink.
 */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();

  return (
    <View
      style={[styles.track, { backgroundColor: theme.surfaceMuted }]}
      accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              selected && { backgroundColor: theme.hairStrong },
              pressed && !selected && styles.pressed,
            ]}>
            <Text
              style={[
                styles.label,
                {
                  color: selected ? theme.ink : theme.inkSecondary,
                  fontWeight: selected ? '600' : '500',
                },
              ]}
              numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: space.xs,
    borderRadius: radius.button,
    padding: space.xs,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.input,
  },
  pressed: { opacity: 0.6 },
  label: { fontSize: 14 },
});
