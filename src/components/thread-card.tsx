import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPeso } from '@/lib/format';
import { isOptimistic, type Thread } from '@/lib/queries/threads';

type Props = {
  thread: Thread;
  /** Resolved by the board from the cached creators list — undefined if just deleted. */
  handle: string | undefined;
};

export function ThreadCard({ thread, handle }: Props) {
  const theme = useTheme();
  const router = useRouter();
  // Faded + non-tappable while only in the optimistic cache — same contract as CreatorRow.
  const pending = isOptimistic(thread.id);

  return (
    <Pressable
      disabled={pending}
      onPress={() => router.push(`/thread/${thread.id}`)}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.surfaceMuted },
        pending && styles.pending,
      ]}>
      <View style={styles.body}>
        <Text style={[styles.product, { color: theme.ink }]} numberOfLines={1}>
          {thread.product}
        </Text>
        <Text style={[styles.handle, { color: theme.inkSecondary }]} numberOfLines={1}>
          {handle ? `@${handle}` : strings.threads.detail.missing}
        </Text>
      </View>
      {thread.sample_cost > 0 ? (
        <Text style={[styles.cost, { color: theme.inkSecondary }]}>
          {formatPeso(thread.sample_cost)}
        </Text>
      ) : null}
      <Feather name="chevron-right" size={18} color={theme.inkMuted} />
    </Pressable>
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
  pending: { opacity: 0.5 },
  body: { flex: 1, gap: 2 },
  product: { ...type.heading },
  handle: { ...type.label, fontWeight: '400' },
  cost: { ...type.money },
});
