/**
 * Display formatting only — pure functions, no state, no side effects.
 * (Date *math* belongs in lib/dates.ts when M8 introduces it.)
 */
import { strings } from '@/constants/strings';
import type { Tables } from '@/lib/database.types';

const stripTrailingZero = (s: string) => s.replace(/\.0$/, '');

/** 850 → "850" · 21400 → "21.4k" · 1000 → "1k" · 1_150_000 → "1.1M" */
export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${stripTrailingZero((n / 1_000_000).toFixed(1))}M`;
  if (n >= 1_000) return `${stripTrailingZero((n / 1_000).toFixed(1))}k`;
  return String(n);
}

/** ISO timestamp → "Jul 14, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type CreatorLike = Pick<Tables<'creators'>, 'platform' | 'niche' | 'followers'>;

/**
 * Secondary line for list rows and the detail hero:
 * "Shopee · beauty · 21.4k followers" — platform shown only when non-TikTok
 * (TikTok Shop is the default context). Empty string when nothing to say.
 */
export function creatorSubtitle(c: CreatorLike): string {
  const parts: string[] = [];
  if (c.platform !== 'tiktok_shop') parts.push(strings.creators.platforms[c.platform]);
  if (c.niche) parts.push(c.niche);
  if (c.followers != null) {
    parts.push(`${formatFollowers(c.followers)} ${strings.creators.followersUnit}`);
  }
  return parts.join(' · ');
}
