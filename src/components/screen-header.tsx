import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { title: string; onBack?: () => void; right?: ReactNode };

export function ScreenHeader({ title, onBack, right }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={({ pressed }) => (pressed ? styles.pressed : null)}>
          <Feather name="chevron-left" size={26} color={theme.ink} />
        </Pressable>
      ) : null}
      <Text style={[styles.title, { color: theme.ink }]} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  pressed: { opacity: 0.6 },
  title: { ...type.title, flex: 1 },
});
