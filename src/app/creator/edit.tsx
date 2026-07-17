import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { CreatorAvatar } from '@/components/creator-avatar';
import { Field } from '@/components/field';
import { Segmented } from '@/components/segmented';
import { strings } from '@/constants/strings';
import { space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatFollowers } from '@/lib/format';
import {
  type Creator,
  creatorKeys,
  findDuplicate,
  normalizeHandle,
  useCreateCreator,
  useCreator,
  useUpdateCreator,
} from '@/lib/queries/creators';

const t = strings.creators.form;

const PLATFORM_OPTIONS: { value: Creator['platform']; label: string }[] = [
  { value: 'tiktok_shop', label: strings.creators.platforms.tiktok_shop },
  { value: 'shopee', label: strings.creators.platforms.shopee },
  { value: 'other', label: strings.creators.platforms.other },
];

export default function CreatorEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = typeof id === 'string' && id.length > 0;

  const { data: existing } = useCreator(editing ? id : undefined);
  const create = useCreateCreator();
  const update = useUpdateCreator();

  // Hydrate once from the loaded creator when editing; never clobber user edits.
  const [hydratedId, setHydratedId] = useState<string | null>(null);
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState<Creator['platform']>('tiktok_shop');
  const [niche, setNiche] = useState('');
  const [followers, setFollowers] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [handleError, setHandleError] = useState<string | null>(null);

  // Adjusting state during render (React's documented alternative to a hydration
  // effect): the creator arrives from the list cache on first render, or later
  // from the network. Keyed by id so it fills exactly once and never clobbers edits.
  const hydrated = !editing || hydratedId === id;
  if (editing && existing && hydratedId !== existing.id) {
    setHydratedId(existing.id);
    setHandle(existing.handle);
    setPlatform(existing.platform);
    setNiche(existing.niche ?? '');
    setFollowers(existing.followers != null ? String(existing.followers) : '');
    setContact(existing.contact ?? '');
    setNotes(existing.notes ?? '');
  }

  function onSave() {
    const normalized = normalizeHandle(handle);
    if (!normalized) {
      setHandleError(t.handleRequired);
      return;
    }

    // Friendly duplicate path: instant, offline-capable, excludes self on edit.
    // The DB unique constraint stays the backstop (rolls back the optimistic write).
    const cached = qc.getQueryData<Creator[]>(creatorKeys.list());
    if (findDuplicate(cached, normalized, platform, editing ? id : undefined)) {
      setHandleError(t.duplicate);
      return;
    }

    const payload = {
      handle: normalized,
      platform,
      niche: niche.trim() || null,
      followers: followers ? parseInt(followers, 10) : null,
      contact: contact.trim() || null,
      notes: notes.trim() || null,
    };

    if (editing) {
      update.mutate({ id, patch: payload });
    } else {
      create.mutate(payload);
    }
    router.back(); // optimistic — the list/detail already show the change
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={t.closeA11y}
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => (pressed ? styles.pressed : null)}>
          <Feather name="x" size={24} color={theme.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.ink }]}>
          {editing ? t.editTitle : t.newTitle}
        </Text>
        {/* Balances the close icon so the title sits optically centred. */}
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatar}>
            <CreatorAvatar handle={normalizeHandle(handle)} size={72} />
            <Text style={[styles.avatarCaption, { color: theme.inkSecondary }]}>
              {t.avatarCaption}
            </Text>
          </View>

          <View style={styles.fields}>
            <Field
              label={t.handleLabel}
              prefix="@"
              prefixTone="heat"
              value={handle}
              onChangeText={(text) => {
                setHandle(text);
                if (handleError) setHandleError(null);
              }}
              error={handleError}
              placeholder={t.handlePlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.platform}>
              <Text style={[styles.platformLabel, { color: theme.inkSecondary }]}>
                {t.platformLabel}
              </Text>
              <Segmented
                options={PLATFORM_OPTIONS}
                value={platform}
                onChange={(p) => {
                  setPlatform(p);
                  if (handleError) setHandleError(null);
                }}
              />
            </View>

            <View style={styles.pair}>
              <View style={styles.niche}>
                <Field
                  label={t.nicheLabel}
                  value={niche}
                  onChangeText={setNiche}
                  placeholder={t.nichePlaceholder}
                />
              </View>
              <View style={styles.followers}>
                <Field
                  label={t.followersLabel}
                  value={followers}
                  onChangeText={(text) => setFollowers(text.replace(/[^0-9]/g, ''))}
                  placeholder={t.followersPlaceholder}
                  keyboardType="number-pad"
                  accessory={
                    followers ? (
                      <Text style={[styles.followersPreview, { color: theme.heat.main }]}>
                        {formatFollowers(parseInt(followers, 10))}
                      </Text>
                    ) : null
                  }
                />
              </View>
            </View>

            <Field
              label={t.contactLabel}
              value={contact}
              onChangeText={setContact}
              placeholder={t.contactPlaceholder}
              autoCapitalize="none"
            />
            <Field
              label={t.notesLabel}
              value={notes}
              onChangeText={setNotes}
              placeholder={t.notesPlaceholder}
              multiline
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.bg, borderTopColor: theme.hair }]}>
          <Button
            label={t.save}
            onPress={onSave}
            disabled={editing && !hydrated} // never save an unhydrated edit (would wipe fields)
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xs,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSpacer: { width: 24 },
  pressed: { opacity: 0.6 },
  content: { paddingBottom: space.lg },
  avatar: { alignItems: 'center', paddingTop: space.md + 2, gap: space.sm },
  avatarCaption: { fontSize: 12 },
  fields: { gap: space.lg, paddingHorizontal: space.lg, paddingTop: space.md },
  platform: { gap: space.xs },
  platformLabel: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  pair: { flexDirection: 'row', gap: space.md },
  niche: { flex: 1.4 },
  followers: { flex: 1 },
  followersPreview: { fontSize: 12, fontWeight: '700' },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
