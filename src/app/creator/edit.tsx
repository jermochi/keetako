import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { ScreenHeader } from '@/components/screen-header';
import { strings } from '@/constants/strings';
import { space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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
const PLATFORMS: Creator['platform'][] = ['tiktok_shop', 'shopee', 'other'];

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
      <ScreenHeader title={editing ? t.editTitle : t.newTitle} onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Field
            label={t.handleLabel}
            prefix="@"
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
            <View style={styles.chips}>
              {PLATFORMS.map((p) => (
                <Chip
                  key={p}
                  label={strings.creators.platforms[p]}
                  selected={platform === p}
                  onPress={() => {
                    setPlatform(p);
                    if (handleError) setHandleError(null);
                  }}
                />
              ))}
            </View>
          </View>

          <Field
            label={t.nicheLabel}
            value={niche}
            onChangeText={setNiche}
            placeholder={t.nichePlaceholder}
          />
          <Field
            label={t.followersLabel}
            value={followers}
            onChangeText={(text) => setFollowers(text.replace(/[^0-9]/g, ''))}
            placeholder={t.followersPlaceholder}
            keyboardType="number-pad"
          />
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

          <Button
            label={t.save}
            onPress={onSave}
            disabled={editing && !hydrated} // never save an unhydrated edit (would wipe fields)
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: space.lg, gap: space.lg },
  platform: { gap: space.sm },
  platformLabel: { ...type.label },
  chips: { flexDirection: 'row', gap: space.sm },
});
