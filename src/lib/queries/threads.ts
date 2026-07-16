import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Enums, Tables, TablesInsert } from '@/lib/database.types';
import { isOptimistic } from '@/lib/queries/creators';
import { supabase } from '@/lib/supabase';

export type Thread = Tables<'threads'>;
export type ThreadStatus = Enums<'thread_status'>;
export type NewThread = Pick<TablesInsert<'threads'>, 'creator_id' | 'product' | 'sample_cost'>;

export { isOptimistic };

export const threadKeys = {
  all: ['threads'] as const,
  list: () => [...threadKeys.all, 'list'] as const,
  detail: (id: string) => [...threadKeys.all, 'detail', id] as const,
};

/** Pipeline order — the enum's own order, requested → gmv_logged. Board sections follow it. */
export const THREAD_STATUS_ORDER: ThreadStatus[] = [
  'requested',
  'approved',
  'shipped',
  'delivered',
  'content_due',
  'posted',
  'gmv_logged',
];

export type ThreadSection = { status: ThreadStatus; data: Thread[] };

/**
 * SectionList-ready grouping, client-side over the cached list: closed threads are
 * not active work and drop out; statuses with nothing in them aren't rendered at all.
 */
export function groupThreadsByStatus(threads: Thread[] | undefined): ThreadSection[] {
  if (!threads?.length) return [];

  const byStatus = new Map<ThreadStatus, Thread[]>();
  for (const thread of threads) {
    if (thread.closed_at) continue;
    const bucket = byStatus.get(thread.status);
    if (bucket) bucket.push(thread);
    else byStatus.set(thread.status, [thread]);
  }

  return THREAD_STATUS_ORDER.flatMap((status) => {
    const data = byStatus.get(status);
    return data ? [{ status, data }] : [];
  });
}

/** The free-plan cap (migration 0003) raised as a PostgREST error on the 11th active thread. */
export function isFreeCapError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    typeof (err as { message?: unknown }).message === 'string' &&
    (err as { message: string }).message.includes('FREE_CAP_REACHED')
  );
}

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

async function fetchThread(id: string): Promise<Thread> {
  const { data, error } = await supabase.from('threads').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

/**
 * Detail served from the list cache instantly (offline-friendly); network refresh
 * only for real ids — optimistic ids don't exist server-side yet.
 */
export function useThread(id: string | undefined) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: threadKeys.detail(id ?? 'missing'),
    enabled: !!id && !isOptimistic(id),
    queryFn: () => fetchThread(id!),
    initialData: () => qc.getQueryData<Thread[]>(threadKeys.list())?.find((t) => t.id === id),
    initialDataUpdatedAt: () => qc.getQueryState(threadKeys.list())?.dataUpdatedAt,
  });
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
