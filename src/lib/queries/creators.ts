import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Creator = Tables<'creators'>;
export type NewCreator = Omit<TablesInsert<'creators'>, 'user_id'>;

export const creatorKeys = {
  all: ['creators'] as const,
  list: () => [...creatorKeys.all, 'list'] as const,
  detail: (id: string) => [...creatorKeys.all, 'detail', id] as const,
};

/** Stored form of a handle: trimmed, no leading @, lowercase. UI renders the @. */
export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase();
}

/** True while a row only exists in the optimistic cache (id from useCreateCreator's onMutate). */
export function isOptimistic(id: string): boolean {
  return id.startsWith('optimistic-');
}

/**
 * Friendly-path duplicate check against the cached list (instant, works offline).
 * Compares normalized handles so pre-normalization rows (e.g. seed data) still match.
 * The DB unique constraint (user_id, handle, platform) is the backstop.
 */
export function findDuplicate(
  creators: Creator[] | undefined,
  handle: string,
  platform: Creator['platform'],
  excludeId?: string,
): Creator | undefined {
  const target = normalizeHandle(handle);
  return creators?.find(
    (c) => c.id !== excludeId && c.platform === platform && normalizeHandle(c.handle) === target,
  );
}

/** Postgres unique_violation, surfaced by PostgREST as code 23505. */
export function isDuplicateCreatorError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505';
}

async function fetchCreators(): Promise<Creator[]> {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function useCreators() {
  return useQuery({ queryKey: creatorKeys.list(), queryFn: fetchCreators });
}

async function fetchCreator(id: string): Promise<Creator> {
  const { data, error } = await supabase.from('creators').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

/**
 * Detail served from the list cache instantly (offline-friendly); network refresh
 * only for real ids — optimistic ids don't exist server-side yet.
 */
export function useCreator(id: string | undefined) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: creatorKeys.detail(id ?? 'missing'),
    enabled: !!id && !isOptimistic(id),
    queryFn: () => fetchCreator(id!),
    initialData: () => qc.getQueryData<Creator[]>(creatorKeys.list())?.find((c) => c.id === id),
    initialDataUpdatedAt: () => qc.getQueryState(creatorKeys.list())?.dataUpdatedAt,
  });
}

async function insertCreator(input: NewCreator): Promise<Creator> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('creators')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Optimistic create: the new creator shows instantly, rolls back on failure. */
export function useCreateCreator() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: insertCreator,
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: creatorKeys.list() });
      const previous = qc.getQueryData<Creator[]>(creatorKeys.list());

      const now = new Date().toISOString();
      const optimistic: Creator = {
        id: `optimistic-${now}`,
        user_id: 'optimistic',
        handle: input.handle,
        platform: input.platform ?? 'tiktok_shop',
        niche: input.niche ?? null,
        followers: input.followers ?? null,
        contact: input.contact ?? null,
        notes: input.notes ?? null,
        tag: input.tag ?? null,
        created_at: now,
        updated_at: now,
      };

      qc.setQueryData<Creator[]>(creatorKeys.list(), (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        qc.setQueryData(creatorKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: creatorKeys.list() });
    },
  });
}

export type CreatorPatch = Partial<
  Pick<Creator, 'handle' | 'platform' | 'niche' | 'followers' | 'contact' | 'notes'>
>;

async function updateCreator({
  id,
  patch,
}: {
  id: string;
  patch: CreatorPatch;
}): Promise<Creator> {
  const { data, error } = await supabase
    .from('creators')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Optimistic update: list + detail caches patch instantly, roll back on failure. */
export function useUpdateCreator() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateCreator,
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: creatorKeys.all });
      const previousList = qc.getQueryData<Creator[]>(creatorKeys.list());
      const previousDetail = qc.getQueryData<Creator>(creatorKeys.detail(id));

      const updated_at = new Date().toISOString();
      qc.setQueryData<Creator[]>(creatorKeys.list(), (old) =>
        old?.map((c) => (c.id === id ? { ...c, ...patch, updated_at } : c)),
      );
      qc.setQueryData<Creator>(creatorKeys.detail(id), (old) =>
        old ? { ...old, ...patch, updated_at } : old,
      );
      return { previousList, previousDetail };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousList) qc.setQueryData(creatorKeys.list(), context.previousList);
      if (context?.previousDetail) {
        qc.setQueryData(creatorKeys.detail(id), context.previousDetail);
      }
    },
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: creatorKeys.list() });
      qc.invalidateQueries({ queryKey: creatorKeys.detail(id) });
    },
  });
}

async function deleteCreator(id: string): Promise<void> {
  const { error } = await supabase.from('creators').delete().eq('id', id);
  if (error) throw error;
}

/** Optimistic delete: row leaves the list instantly, returns on failure. */
export function useDeleteCreator() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteCreator,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: creatorKeys.all });
      const previous = qc.getQueryData<Creator[]>(creatorKeys.list());
      qc.setQueryData<Creator[]>(creatorKeys.list(), (old) => old?.filter((c) => c.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(creatorKeys.list(), context.previous);
    },
    onSettled: (_data, _err, id) => {
      qc.removeQueries({ queryKey: creatorKeys.detail(id) });
      qc.invalidateQueries({ queryKey: creatorKeys.list() });
    },
  });
}
