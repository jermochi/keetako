import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreatorAvatar } from '@/components/creator-avatar';
import { ScreenHeader } from '@/components/screen-header';
import { strings } from '@/constants/strings';
import { radius, space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatFollowers } from '@/lib/format';
import { useCreator, useDeleteCreator } from '@/lib/queries/creators';

const t = strings.creators.detail;

export default function CreatorDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: creator, isLoading } = useCreator(id);
  const del = useDeleteCreator();

  if (!creator) {
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

  function confirmDelete() {
    Alert.alert(t.deleteConfirmTitle, t.deleteConfirmBody, [
      { text: t.deleteCancel, style: 'cancel' },
      {
        text: t.deleteConfirm,
        style: 'destructive',
        onPress: () => {
          del.mutate(creator!.id);
          router.back(); // list already shows the optimistic removal
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <ScreenHeader title="" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <CreatorAvatar handle={creator.handle} size={88} />
          <Text style={[styles.handle, { color: theme.ink }]}>@{creator.handle}</Text>
          <View style={styles.tags}>
            <Tag label={strings.creators.platforms[creator.platform]} />
            {creator.niche ? <Tag label={creator.niche} /> : null}
          </View>
        </View>

        <View style={styles.actions}>
          <Action
            label={t.newThread}
            tone="heat"
            onPress={() =>
              router.push({ pathname: '/thread/new', params: { creatorId: creator.id } })
            }
          />
          <Action
            label={t.edit}
            tone="ink"
            onPress={() => router.push({ pathname: '/creator/edit', params: { id: creator.id } })}
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.surfaceMuted }]}>
          <DetailRow label={t.contact} value={creator.contact} />
          <DetailRow
            label={t.followers}
            value={creator.followers != null ? formatFollowers(creator.followers) : null}
          />
          <DetailRow label={t.added} value={formatDate(creator.created_at)} last />
        </View>

        <View style={[styles.card, styles.notes, { backgroundColor: theme.surfaceMuted }]}>
          <Text style={[styles.notesLabel, { color: theme.inkSecondary }]}>
            {t.notes.toUpperCase()}
          </Text>
          <Text style={[styles.notesBody, { color: creator.notes ? theme.ink : theme.inkSecondary }]}>
            {creator.notes ?? t.missing}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={confirmDelete}
          style={({ pressed }) => [styles.delete, pressed && styles.pressed]}>
          <Text style={[styles.deleteLabel, { color: theme.heat.main }]}>{t.deleteCta}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Read-only descriptor (platform, niche) — a label, not a filter. */
function Tag({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View style={[tagStyles.tag, { backgroundColor: theme.surfaceMuted }]}>
      <Text style={[tagStyles.label, { color: theme.inkSecondary }]}>{label}</Text>
    </View>
  );
}

function Action({
  label,
  tone,
  onPress,
}: {
  label: string;
  tone: 'heat' | 'ink';
  onPress: () => void;
}) {
  const theme = useTheme();
  const heat = tone === 'heat';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        actionStyles.base,
        { backgroundColor: heat ? theme.heat.main : theme.surfaceMuted },
        pressed && actionStyles.pressed,
      ]}>
      <Text
        style={[
          actionStyles.label,
          { color: heat ? theme.heat.on : theme.ink, fontWeight: heat ? '700' : '600' },
        ]}>
        {label}
      </Text>
    </Pressable>
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
  content: { paddingBottom: space.xl },
  pressed: { opacity: 0.6 },
  hero: { alignItems: 'center', paddingHorizontal: space.lg },
  handle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3, marginTop: space.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: space.sm },
  actions: {
    flexDirection: 'row',
    gap: space.sm + 2,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  card: {
    marginHorizontal: space.lg,
    marginTop: space.lg,
    borderRadius: radius.card,
    paddingHorizontal: space.lg,
    overflow: 'hidden',
  },
  notes: { marginTop: space.md, paddingVertical: space.md + 2, gap: 6 },
  notesLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  notesBody: { fontSize: 14, lineHeight: 20 },
  delete: { alignItems: 'center', paddingHorizontal: space.lg, paddingTop: space.xl },
  deleteLabel: { fontSize: 14, fontWeight: '600' },
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

const tagStyles = StyleSheet.create({
  tag: { borderRadius: 14, paddingVertical: 5, paddingHorizontal: 11 },
  label: { fontSize: 12, fontWeight: '600' },
});

const actionStyles = StyleSheet.create({
  base: {
    flex: 1,
    height: 42,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  label: { fontSize: 14 },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingVertical: 13,
  },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});
