import { Feather } from '@expo/vector-icons';
import { onlineManager } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Field } from '@/components/field';
import { InitialsAvatar } from '@/components/initials-avatar';
import { ScreenHeader } from '@/components/screen-header';
import { strings } from '@/constants/strings';
import { radius, space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type Creator, normalizeHandle, useCreateCreator, useCreators } from '@/lib/queries/creators';
import { isFreeCapError, useCreateThread } from '@/lib/queries/threads';

const t = strings.threads.form;

export default function NewThreadScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { creatorId } = useLocalSearchParams<{ creatorId?: string }>();
  const { data: creators } = useCreators();
  const create = useCreateThread();

  const [selectedId, setSelectedId] = useState<string | undefined>(creatorId);
  const [product, setProduct] = useState('');
  const [cost, setCost] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [creatorError, setCreatorError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const selected = creators?.find((c) => c.id === selectedId);

  function onSave() {
    let invalid = false;
    if (!selectedId) {
      setCreatorError(t.creatorRequired);
      invalid = true;
    }
    if (!product.trim()) {
      setProductError(t.productRequired);
      invalid = true;
    }
    if (invalid) return;

    setFormError(null);
    create.mutate(
      {
        creator_id: selectedId!,
        product: product.trim(),
        sample_cost: cost ? parseInt(cost, 10) : 0,
      },
      {
        onSuccess: () => router.back(),
        onError: (err) => setFormError(isFreeCapError(err) ? t.freeCap : t.saveError),
      },
    );

    // Offline the mutation pauses (never settles until reconnect), so the optimistic
    // thread is already on the board — leave now rather than spin on a pending promise.
    if (!onlineManager.isOnline()) router.back();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <ScreenHeader title={t.newTitle} onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.picker}>
            <Text style={[styles.label, { color: theme.inkSecondary }]}>{t.creatorLabel}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setPickerOpen(true);
                setCreatorError(null);
              }}
              style={({ pressed }) => [
                styles.pickerField,
                { backgroundColor: theme.surfaceMuted },
                pressed && styles.pressed,
              ]}>
              {selected ? (
                <>
                  <InitialsAvatar handle={selected.handle} size={28} />
                  <Text style={[styles.pickerValue, { color: theme.ink }]} numberOfLines={1}>
                    @{selected.handle}
                  </Text>
                </>
              ) : (
                <Text style={[styles.pickerValue, { color: theme.inkMuted }]}>
                  {t.creatorPlaceholder}
                </Text>
              )}
              <Feather name="chevron-down" size={18} color={theme.inkMuted} />
            </Pressable>
            {creatorError ? (
              <Text style={[styles.error, { color: theme.heat.main }]}>{creatorError}</Text>
            ) : null}
          </View>

          <Field
            label={t.productLabel}
            value={product}
            onChangeText={(text) => {
              setProduct(text);
              if (productError) setProductError(null);
            }}
            error={productError}
            placeholder={t.productPlaceholder}
          />

          <Field
            label={t.costLabel}
            prefix="₱"
            value={cost}
            onChangeText={(text) => setCost(text.replace(/[^0-9]/g, ''))}
            placeholder={t.costPlaceholder}
            keyboardType="number-pad"
          />

          {formError ? (
            <Text style={[styles.error, { color: theme.heat.main }]}>{formError}</Text>
          ) : null}

          <Button label={t.save} onPress={onSave} loading={create.isPending} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CreatorPicker
        visible={pickerOpen}
        creators={creators}
        onClose={() => setPickerOpen(false)}
        onSelect={(creator) => {
          setSelectedId(creator.id);
          setPickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function CreatorPicker({
  visible,
  creators,
  onClose,
  onSelect,
}: {
  visible: boolean;
  creators: Creator[] | undefined;
  onClose: () => void;
  onSelect: (creator: Creator) => void;
}) {
  const theme = useTheme();
  const createCreator = useCreateCreator();
  const [query, setQuery] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const normalized = normalizeHandle(query);

  const filtered = useMemo(() => {
    if (!creators) return [];
    if (!normalized) return creators;
    return creators.filter((c) => normalizeHandle(c.handle).includes(normalized));
  }, [creators, normalized]);

  // Offer quick-add only when the typed handle isn't already tracked.
  const canQuickAdd =
    normalized.length > 0 && !filtered.some((c) => normalizeHandle(c.handle) === normalized);

  async function quickAdd() {
    // The insert needs a real FK, and an optimistic id isn't one — so this path
    // must reach the server. Offline, say so instead of pretending it worked.
    if (!onlineManager.isOnline()) {
      setAddError(t.pickerAddOffline);
      return;
    }
    setAddError(null);
    try {
      const creator = await createCreator.mutateAsync({ handle: normalized, platform: 'tiktok_shop' });
      setQuery('');
      onSelect(creator);
    } catch {
      setAddError(t.pickerAddError);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
        <SafeAreaView style={styles.flex} edges={['bottom']}>
          <ScreenHeader
            title={t.creatorLabel}
            right={
              <Pressable onPress={onClose} hitSlop={12}>
                <Feather name="x" size={22} color={theme.ink} />
              </Pressable>
            }
          />

          <View style={[styles.search, { backgroundColor: theme.surfaceMuted }]}>
            <Feather name="search" size={18} color={theme.inkMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.ink }]}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                if (addError) setAddError(null);
              }}
              placeholder={t.pickerSearchPlaceholder}
              placeholderTextColor={theme.inkMuted}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>

          {addError ? (
            <Text style={[styles.error, styles.addError, { color: theme.heat.main }]}>
              {addError}
            </Text>
          ) : null}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={({ pressed }) => [
                  styles.pickerRow,
                  pressed && { backgroundColor: theme.surfaceMuted },
                ]}>
                <InitialsAvatar handle={item.handle} size={32} />
                <Text style={[styles.pickerHandle, { color: theme.ink }]} numberOfLines={1}>
                  @{item.handle}
                </Text>
              </Pressable>
            )}
            ListFooterComponent={
              canQuickAdd ? (
                <Pressable
                  disabled={createCreator.isPending}
                  onPress={quickAdd}
                  style={({ pressed }) => [
                    styles.pickerRow,
                    pressed && { backgroundColor: theme.surfaceMuted },
                  ]}>
                  <View style={[styles.addIcon, { borderColor: theme.hairStrong }]}>
                    {createCreator.isPending ? (
                      <ActivityIndicator size="small" color={theme.heat.main} />
                    ) : (
                      <Feather name="plus" size={16} color={theme.heat.main} />
                    )}
                  </View>
                  <Text style={[styles.pickerHandle, { color: theme.heat.main }]} numberOfLines={1}>
                    {t.pickerAdd(normalized)}
                  </Text>
                </Pressable>
              ) : null
            }
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: space.lg, gap: space.lg },
  label: { ...type.label },
  pressed: { opacity: 0.8 },
  picker: { gap: space.sm },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.input,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 56,
  },
  pickerValue: { flex: 1, fontSize: 16 },
  error: { fontSize: 13, fontWeight: '600' },
  addError: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  sheet: { flex: 1, marginTop: space.xxxl, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet },
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
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  pickerHandle: { ...type.heading, flex: 1 },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { paddingBottom: space.xl },
});
