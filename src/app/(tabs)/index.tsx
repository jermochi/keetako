import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { Fab } from '@/components/fab';
import { ThreadCard } from '@/components/thread-card';
import { strings } from '@/constants/strings';
import { BottomTabInset, space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreators } from '@/lib/queries/creators';
import { groupThreadsByStatus, type ThreadStatus, useThreads } from '@/lib/queries/threads';
import { supabase } from '@/lib/supabase';

const t = strings.pipeline;

export default function PipelineScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: threads, isLoading, isError, refetch } = useThreads();
  const { data: creators } = useCreators();

  const sections = useMemo(() => groupThreadsByStatus(threads), [threads]);

  // One lookup map for the whole board — each card's handle comes from the
  // already-cached creators list, so the board renders offline and never joins.
  const handleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const creator of creators ?? []) map.set(creator.id, creator.handle);
    return map;
  }, [creators]);

  const hasThreads = sections.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.ink }]}>{t.title}</Text>
        {/* Temporary — replaced by the Settings tab in M10. */}
        <Pressable
          onPress={() => supabase.auth.signOut()}
          hitSlop={12}
          style={({ pressed }) => (pressed ? styles.pressed : null)}>
          <Text style={[styles.signOut, { color: theme.inkSecondary }]}>{strings.home.signOut}</Text>
        </Pressable>
      </View>

      {isLoading && !threads ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : isError && !threads ? (
        <View style={styles.center}>
          <Text style={[styles.stateTitle, { color: theme.ink }]}>{t.loadError.title}</Text>
          <Text style={[styles.stateBody, { color: theme.inkSecondary }]}>{t.loadError.body}</Text>
          <View style={styles.retry}>
            <Button
              label={t.loadError.retry}
              onPress={() => refetch()}
              variant="outline"
              tone="ink"
            />
          </View>
        </View>
      ) : !hasThreads ? (
        <EmptyState
          art={<PipelineSketch />}
          title={t.empty.title}
          accent={t.empty.accent}
          body={t.empty.body}
          ctaLabel={t.empty.cta}
          onCta={() => router.push('/thread/new')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThreadCard thread={item} handle={handleById.get(item.creator_id)} />
          )}
          renderSectionHeader={({ section }) => (
            <SectionHeader status={section.status} count={section.data.length} />
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {hasThreads ? (
        <Fab
          label={t.newThread}
          a11yLabel={t.newThreadA11y}
          onPress={() => router.push('/thread/new')}
        />
      ) : null}
    </SafeAreaView>
  );
}

function SectionHeader({ status, count }: { status: ThreadStatus; count: number }) {
  const theme = useTheme();
  const label = t.statuses[status];

  return (
    <View
      accessibilityRole="header"
      accessibilityLabel={t.sectionCountA11y(label, count)}
      style={[styles.sectionHeader, { backgroundColor: theme.bg, borderTopColor: theme.hair }]}>
      <Text style={[styles.sectionLabel, { color: theme.inkSecondary }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.sectionCount, { color: theme.inkMuted }]}>{count}</Text>
    </View>
  );
}

/** View-built sketch: a sample leaves, then the beat where the video should come back. */
function PipelineSketch() {
  const theme = useTheme();

  return (
    <View style={sketch.frame}>
      <View style={[sketch.rail, { backgroundColor: theme.hair }]} />
      <View style={[sketch.node, { backgroundColor: theme.ink, left: 0 }]} />
      <View style={[sketch.node, { backgroundColor: theme.surfaceMuted, left: 46 }]} />
      <View style={[sketch.node, { backgroundColor: theme.surfaceMuted, left: 92 }]} />
      <View style={[sketch.dashNode, { borderColor: theme.inkMuted, left: 136 }]} />
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
  pressed: { opacity: 0.6 },
  signOut: { ...type.label },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  sectionLabel: { ...type.label, letterSpacing: 0.8 },
  sectionCount: { ...type.label },
  listContent: { paddingBottom: BottomTabInset + space.xxxl },
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
  frame: { width: 150, height: 40, justifyContent: 'center' },
  rail: { position: 'absolute', left: 4, right: 6, height: StyleSheet.hairlineWidth },
  node: { position: 'absolute', width: 10, height: 10, borderRadius: 3 },
  dashNode: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'dashed', // may render solid on some Android versions — acceptable
  },
});
