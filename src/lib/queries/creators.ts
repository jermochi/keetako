import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Creator = Tables<'creators'>;
export type NewCreator = Omit<TablesInsert<'creators'>, 'user_id'>;

export const creatorKeys = {
  all: ['creators'] as const,
  list: () => [...creatorKeys.all, 'list'] as const,
};

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
