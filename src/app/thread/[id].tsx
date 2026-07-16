import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InitialsAvatar } from '@/components/initials-avatar';
import { ScreenHeader } from '@/components/screen-header';
import { strings } from '@/constants/strings';
import { radius, space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatPeso } from '@/lib/format';
import { useCreators } from '@/lib/queries/creators';
import { useThread } from '@/lib/queries/threads';

const t = strings.threads.detail;

export default function ThreadDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: thread, isLoading } = useThread(id);
  const { data: creators } = useCreators();

  if (!thread) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
        <ScreenHeader title="" onBack={() => router.back()} />
        <View style={styles.center}>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Text style={[styles.stateTitle, { color: theme.ink }]}>{t.notFoundTitle}</Text>
              <Text style={[styles.stateBody, { color: theme.inkSecondary }]}>{t.notFoundBody}</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const creator = creators?.find((c) => c.id === thread.creator_id);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <ScreenHeader title="" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={[styles.product, { color: theme.ink }]}>{thread.product}</Text>
          <Text style={[styles.status, { color: theme.inkSecondary }]}>
            {strings.pipeline.statuses[thread.status]}
          </Text>
        </View>

        {creator ? (
          <Pressable
            onPress={() => router.push(`/creator/${creator.id}`)}
            style={({ pressed }) => [
              styles.creatorRow,
              { backgroundColor: theme.surface, borderColor: theme.hair },
              pressed && { backgroundColor: theme.surfaceMuted },
            ]}>
            <InitialsAvatar handle={creator.handle} />
            <Text style={[styles.creatorHandle, { color: theme.ink }]} numberOfLines={1}>
              @{creator.handle}
            </Text>
            <Feather name="chevron-right" size={18} color={theme.inkMuted} />
          </Pressable>
        ) : null}

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.hair }]}>
          <DetailRow label={t.cost} value={formatPeso(thread.sample_cost)} />
          <DetailRow label={t.created} value={formatDate(thread.created_at)} last />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string | null | undefined;
  last?: boolean;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        rowStyles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.hair },
      ]}>
      <Text style={[rowStyles.label, { color: theme.inkSecondary }]}>{label}</Text>
      <Text style={[rowStyles.value, { color: value ? theme.ink : theme.inkSecondary }]}>
        {value ?? t.missing}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: space.lg, gap: space.lg },
  hero: { gap: space.xs, alignItems: 'flex-start' },
  product: { ...type.title },
  status: { ...type.label, fontWeight: '400' },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  creatorHandle: { ...type.heading, flex: 1 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  stateTitle: { ...type.heading, textAlign: 'center' },
  stateBody: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  label: { ...type.label },
  value: { fontSize: 15, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
});
