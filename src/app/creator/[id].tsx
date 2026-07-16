import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { InitialsAvatar } from '@/components/initials-avatar';
import { ScreenHeader } from '@/components/screen-header';
import { strings } from '@/constants/strings';
import { radius, space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { creatorSubtitle, formatDate, formatFollowers } from '@/lib/format';
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

  const subtitle = creatorSubtitle(creator);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        right={
          <Pressable
            onPress={() => router.push({ pathname: '/creator/edit', params: { id: creator.id } })}
            hitSlop={12}
            style={({ pressed }) => (pressed ? styles.pressed : null)}>
            <Text style={[styles.editLink, { color: theme.ink }]}>{t.edit}</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <InitialsAvatar handle={creator.handle} size={56} />
          <Text style={[styles.handle, { color: theme.ink }]}>@{creator.handle}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.inkSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.hair }]}>
          <DetailRow label={t.platform} value={strings.creators.platforms[creator.platform]} />
          <DetailRow
            label={t.followers}
            value={creator.followers != null ? formatFollowers(creator.followers) : null}
          />
          <DetailRow label={t.niche} value={creator.niche} />
          <DetailRow label={t.contact} value={creator.contact} />
          <DetailRow label={t.added} value={formatDate(creator.created_at)} last />
        </View>

        <View
          style={[styles.card, styles.notes, { backgroundColor: theme.surface, borderColor: theme.hair }]}>
          <Text style={[styles.notesLabel, { color: theme.inkSecondary }]}>{t.notes}</Text>
          <Text style={[styles.notesBody, { color: creator.notes ? theme.ink : theme.inkSecondary }]}>
            {creator.notes ?? t.missing}
          </Text>
        </View>

        <Button label={t.deleteCta} onPress={confirmDelete} variant="outline" tone="heat" />
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
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.hair,
        },
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
  pressed: { opacity: 0.6 },
  editLink: { ...type.heading },
  hero: { gap: space.sm, alignItems: 'flex-start' },
  handle: { ...type.title, marginTop: space.xs },
  subtitle: { ...type.label, fontWeight: '400' },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  notes: { padding: space.lg, gap: space.sm },
  notesLabel: { ...type.label },
  notesBody: { ...type.body },
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
