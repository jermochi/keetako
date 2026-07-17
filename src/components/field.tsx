import { type ReactNode, useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { radius, space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  /** Rendered inside the input, before the text — e.g. "@" for handles. */
  prefix?: string;
  /** heat draws the eye to the field that defines the record (the handle). */
  prefixTone?: 'muted' | 'heat';
  /** Rendered inside the input, after the text — e.g. a live "21.4k" preview. */
  accessory?: ReactNode;
};

export function Field({
  label,
  error,
  prefix,
  prefixTone = 'muted',
  accessory,
  style,
  multiline,
  onFocus,
  onBlur,
  ...inputProps
}: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  // An error outranks focus: if the field is wrong, say so even while it's active.
  const outline = error ? theme.heat.main : focused ? theme.heat.main : 'transparent';

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.inkSecondary }]}>{label}</Text>
      {/* Halo pads unconditionally so focus tints it rather than resizing the row. */}
      <View style={[styles.halo, { backgroundColor: focused ? theme.heat.soft : 'transparent' }]}>
        <View
          style={[
            styles.inputRow,
            { backgroundColor: theme.surfaceMuted, borderColor: outline },
            multiline && styles.multiRow,
          ]}>
          {prefix ? (
            <Text
              style={[
                styles.prefix,
                {
                  color: prefixTone === 'heat' ? theme.heat.main : theme.inkMuted,
                  fontWeight: prefixTone === 'heat' ? '600' : '400',
                },
              ]}>
              {prefix}
            </Text>
          ) : null}
          <TextInput
            style={[styles.input, { color: theme.ink }, multiline && styles.multiInput, style]}
            placeholderTextColor={theme.inkMuted}
            multiline={multiline}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...inputProps}
          />
          {accessory}
        </View>
      </View>
      {error ? <Text style={[styles.error, { color: theme.heat.main }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  label: { ...type.label, fontWeight: '600' },
  halo: { borderRadius: radius.button + 3, padding: 3 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 50,
    borderWidth: 1.5,
    borderRadius: radius.button,
    paddingHorizontal: space.lg,
  },
  multiRow: { alignItems: 'flex-start' },
  prefix: { fontSize: 15 },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  multiInput: { minHeight: 88, paddingVertical: space.lg - 2, textAlignVertical: 'top' },
  error: { fontSize: 13, fontWeight: '600' },
});
