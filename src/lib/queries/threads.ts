import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Thread = Tables<'threads'>;
export type NewThread = Pick<TablesInsert<'threads'>, 'creator_id' | 'product' | 'sample_cost'>;

export const threadKeys = {
  all: ['threads'] as const,
  list: () => [...threadKeys.all, 'list'] as const,
};

async function fetchThreads(): Promise<Thread[]> {
  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function useThreads() {
  return useQuery({ queryKey: threadKeys.list(), queryFn: fetchThreads });
}

async function insertThread(input: NewThread): Promise<Thread> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('threads')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Optimistic create: the new thread lands in Requested instantly, rolls back on failure. */
export function useCreateThread() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: insertThread,
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: threadKeys.list() });
      const previous = qc.getQueryData<Thread[]>(threadKeys.list());

      const now = new Date().toISOString();
      const optimistic: Thread = {
        id: `optimistic-${now}`,
        user_id: 'optimistic',
        creator_id: input.creator_id,
        product: input.product,
        status: 'requested',
        sample_cost: input.sample_cost ?? 0,
        tracking_number: null,
        ship_date: null,
        content_due_date: null,
        posted_url: null,
        posted_at: null,
        gmv: null,
        gmv_logged_at: null,
        closed_at: null,
        status_changed_at: now,
        created_at: now,
        updated_at: now,
      };

      qc.setQueryData<Thread[]>(threadKeys.list(), (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        qc.setQueryData(threadKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: threadKeys.list() });
    },
  });
}
