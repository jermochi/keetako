import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { radius, space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  /** Rendered inside the input, before the text — e.g. "@" for handles. */
  prefix?: string;
};

export function Field({ label, error, prefix, style, multiline, ...inputProps }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.inkSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.surfaceMuted },
          multiline && styles.multiRow,
        ]}>
        {prefix ? <Text style={[styles.prefix, { color: theme.inkMuted }]}>{prefix}</Text> : null}
        <TextInput
          style={[styles.input, { color: theme.ink }, multiline && styles.multiInput, style]}
          placeholderTextColor={theme.inkMuted}
          multiline={multiline}
          {...inputProps}
        />
      </View>
      {error ? <Text style={[styles.error, { color: theme.heat.main }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { ...type.label },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.input,
    paddingHorizontal: space.lg,
  },
  multiRow: { alignItems: 'flex-start' },
  prefix: { fontSize: 16, marginRight: 2 },
  input: { flex: 1, fontSize: 16, paddingVertical: space.lg },
  multiInput: { minHeight: 100, textAlignVertical: 'top' },
  error: { fontSize: 13, fontWeight: '600' },
});
