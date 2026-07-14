import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type CreatorStats = Tables<'creator_stats'>;
export type MonthlyReport = Tables<'monthly_report'>;

export const statsKeys = {
  all: ['stats'] as const,
  creators: () => [...statsKeys.all, 'creators'] as const,
  monthly: () => [...statsKeys.all, 'monthly'] as const,
};

async function fetchCreatorStats(): Promise<CreatorStats[]> {
  const { data, error } = await supabase.from('creator_stats').select('*');
  if (error) throw error;
  return data ?? [];
}

/** Per-creator rollups (samples, cost, GMV, ROI, ghost flag) — used by the ROI Board (M16). */
export function useCreatorStats() {
  return useQuery({ queryKey: statsKeys.creators(), queryFn: fetchCreatorStats });
}

async function fetchMonthlyReport(): Promise<MonthlyReport[]> {
  const { data, error } = await supabase
    .from('monthly_report')
    .select('*')
    .order('month', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Per-month rollups — used by the Monthly Report card (M17). */
export function useMonthlyReport() {
  return useQuery({ queryKey: statsKeys.monthly(), queryFn: fetchMonthlyReport });
}
