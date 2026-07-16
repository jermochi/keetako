import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { InitialsAvatar } from '@/components/initials-avatar';
import { strings } from '@/constants/strings';
import { radius, space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { creatorSubtitle } from '@/lib/format';
import { type Creator, isOptimistic, useCreators } from '@/lib/queries/creators';

const t = strings.creators;

export default function CreatorsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCreators();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) => c.handle.includes(q) || c.niche?.toLowerCase().includes(q));
  }, [data, query]);

  const hasCreators = (data?.length ?? 0) > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.ink }]}>{t.title}</Text>
        <Pressable
          accessibilityLabel={t.addA11y}
          onPress={() => router.push('/creator/edit')}
          style={({ pressed }) => [
            styles.add,
            { backgroundColor: theme.heat.main },
            pressed && styles.pressed,
          ]}>
          <Feather name="plus" size={22} color={theme.heat.on} />
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
            <Feather name="search" size={18} color={theme.inkMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.ink }]}
              value={query}
              onChangeText={setQuery}
              placeholder={t.searchPlaceholder}
              placeholderTextColor={theme.inkMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Feather name="x" size={18} color={theme.inkMuted} />
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CreatorRow creator={item} />}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: theme.hair }]} />
            )}
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
  const subtitle = creatorSubtitle(creator);

  return (
    <Pressable
      disabled={pending}
      onPress={() => router.push(`/creator/${creator.id}`)}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.surfaceMuted },
        pending && styles.pendingRow,
      ]}>
      <InitialsAvatar handle={creator.handle} />
      <View style={styles.rowBody}>
        <Text style={[styles.handle, { color: theme.ink }]} numberOfLines={1}>
          @{creator.handle}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.inkSecondary }]} numberOfLines={1}>
            {subtitle}
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
    paddingTop: space.md,
    paddingBottom: space.md,
  },
  title: { ...type.display },
  add: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.lg,
    marginBottom: space.md,
    borderRadius: radius.input,
    paddingHorizontal: space.md,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: space.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  pendingRow: { opacity: 0.5 },
  rowBody: { flex: 1, gap: 2 },
  handle: { ...type.heading },
  subtitle: { ...type.label, fontWeight: '400' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 68 },
  listContent: { paddingBottom: space.xl },
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
