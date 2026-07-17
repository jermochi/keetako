import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { CreatorAvatar } from '@/components/creator-avatar';
import { EmptyState } from '@/components/empty-state';
import { strings } from '@/constants/strings';
import { floating, space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { creatorMeta } from '@/lib/format';
import { type Creator, isOptimistic, useCreators } from '@/lib/queries/creators';

const t = strings.creators;

type Filter = 'all' | Creator['platform'];

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: t.filterAll },
  { value: 'tiktok_shop', label: t.platforms.tiktok_shop },
  { value: 'shopee', label: t.platforms.shopee },
  { value: 'other', label: t.platforms.other },
];

export default function CreatorsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCreators();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.filter((c) => {
      if (filter !== 'all' && c.platform !== filter) return false;
      if (!q) return true;
      return c.handle.includes(q) || !!c.niche?.toLowerCase().includes(q);
    });
  }, [data, query, filter]);

  const hasCreators = (data?.length ?? 0) > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.ink }]}>{t.title}</Text>
          {hasCreators ? (
            <Text style={[styles.count, { color: theme.inkSecondary }]}>
              {t.countLine(data!.length)}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel={t.addA11y}
          accessibilityRole="button"
          onPress={() => router.push('/creator/edit')}
          // backgroundColor is invisible under the gradient, but Android derives the
          // elevation shadow from the view's outline — no background, no shadow.
          style={({ pressed }) => [
            styles.addWrap,
            { backgroundColor: theme.heat.main },
            pressed && styles.pressed,
          ]}>
          <LinearGradient
            colors={theme.ringGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.add}>
            <Feather name="plus" size={18} color={theme.onGradient} />
          </LinearGradient>
        </Pressable>
      </View>

      {isLoading && !data ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : isError && !data ? (
        <View style={styles.center}>
          <Text style={[styles.stateTitle, { color: theme.ink }]}>{t.loadError.title}</Text>
          <Text style={[styles.stateBody, { color: theme.inkSecondary }]}>{t.loadError.body}</Text>
          <View style={styles.retry}>
            <Button label={t.loadError.retry} onPress={() => refetch()} variant="outline" tone="ink" />
          </View>
        </View>
      ) : !hasCreators ? (
        // Search and filters are withheld here on purpose: there is nothing to
        // search, and a control that can't do anything is worse than no control.
        <EmptyState
          art={<LedgerSketch />}
          title={t.empty.title}
          accent={t.empty.accent}
          body={t.empty.body}
          ctaLabel={t.empty.cta}
          onCta={() => router.push('/creator/edit')}
        />
      ) : (
        <>
          <View style={[styles.search, { backgroundColor: theme.surfaceMuted }]}>
            <Feather name="search" size={16} color={theme.inkSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.ink }]}
              value={query}
              onChangeText={setQuery}
              placeholder={t.searchPlaceholder}
              placeholderTextColor={theme.inkSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Feather name="x" size={16} color={theme.inkSecondary} />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
            contentContainerStyle={styles.filters}>
            {FILTERS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                selected={filter === f.value}
                onPress={() => setFilter(f.value)}
              />
            ))}
          </ScrollView>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CreatorRow creator={item} />}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={[styles.stateTitle, { color: theme.ink }]}>{t.noResults.title}</Text>
                <Text style={[styles.stateBody, { color: theme.inkSecondary }]}>
                  {t.noResults.body}
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}
    </SafeAreaView>
  );
}

function CreatorRow({ creator }: { creator: Creator }) {
  const theme = useTheme();
  const router = useRouter();
  // Faded + non-tappable while only in the optimistic cache: pending is
  // visible, not broken. Syncs in ~a second online; resolves on reconnect offline.
  const pending = isOptimistic(creator.id);
  const meta = creatorMeta(creator);

  return (
    <Pressable
      disabled={pending}
      accessibilityRole="button"
      onPress={() => router.push(`/creator/${creator.id}`)}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.surfaceMuted },
        pending && styles.pendingRow,
      ]}>
      <CreatorAvatar handle={creator.handle} size={52} />
      <View style={styles.rowBody}>
        <Text style={[styles.handle, { color: theme.ink }]} numberOfLines={1}>
          @{creator.handle}
        </Text>
        {meta ? (
          <Text style={[styles.meta, { color: theme.inkSecondary }]} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={18} color={theme.inkMuted} />
    </Pressable>
  );
}

/** View-built echo of the mockup's empty-ledger sketch — no SVG dependency. */
function LedgerSketch() {
  const theme = useTheme();

  return (
    <View style={sketch.frame}>
      <View style={[sketch.line, { backgroundColor: theme.hair, top: 14 }]} />
      <View style={[sketch.line, { backgroundColor: theme.hair, top: 34 }]} />
      <View style={[sketch.line, { backgroundColor: theme.hair, top: 54 }]} />
      <View
        style={[sketch.pill, { backgroundColor: theme.surfaceMuted, top: 20, left: 0, width: 88 }]}
      />
      <View style={[sketch.pill, { backgroundColor: theme.ink, top: 20, left: 106, width: 38 }]} />
      <View style={[sketch.dashCircle, { borderColor: theme.inkSecondary, top: 52, left: 20 }]} />
      <View
        style={[
          sketch.pill,
          { backgroundColor: theme.surfaceMuted, top: 55, left: 36, width: 52, height: 7 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  headerText: { gap: space.xs, flexShrink: 1 },
  title: { ...type.display },
  count: { fontSize: 13, lineHeight: 18 },
  addWrap: { ...floating, borderRadius: 21 },
  add: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm + 2,
    height: 42,
    marginHorizontal: space.lg,
    marginTop: space.md + 2,
    borderRadius: 21,
    paddingHorizontal: space.lg,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  filterRow: { flexGrow: 0, marginTop: space.md },
  filters: { gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md + 2,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 1,
  },
  pendingRow: { opacity: 0.5 },
  rowBody: { flex: 1, gap: 2 },
  handle: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 13, lineHeight: 18 },
  listContent: { paddingTop: space.xs, paddingBottom: space.xl },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: space.xxxl,
    gap: space.sm,
  },
  stateTitle: { ...type.heading, textAlign: 'center' },
  stateBody: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  retry: { marginTop: space.md, minWidth: 140 },
});

const sketch = StyleSheet.create({
  frame: { width: 150, height: 72 },
  line: { position: 'absolute', left: 0, right: 6, height: StyleSheet.hairlineWidth },
  pill: { position: 'absolute', height: 10, borderRadius: 3 },
  dashCircle: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'dashed', // may render solid on some Android versions — acceptable
  },
});
