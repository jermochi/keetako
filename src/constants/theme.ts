/**
 * Keetako "The Ledger" tokens — v5 (approved in .local/m5-visual-direction-result.md).
 *
 * The one rule: ink reads, heat acts.
 *   - Everything you read — every figure, every status — is ink; weight and size do the talking.
 *   - `heat` is the ONLY accent and means "act here": alerts, at-risk money, primary CTA, destructive.
 *   - Earning = filled ink pill · waiting = outline chip · ghost = fade + "—". No second accent, ever.
 *   - Dark is the flagship theme; light is a full peer.
 *
 * Type is system-font, weight-driven (zero dependency — the FB/IG route). If
 * @expo-google-fonts/plus-jakarta-sans is approved later, add fontFamily per style here.
 */

import '@/global.css';

import { Platform, type TextStyle } from 'react-native';

// `as const` would freeze this into a readonly tuple, which RN's TextStyle
// (a mutable FontVariant[]) rejects — every money style would fail to compile.
const tabularNums = ['tabular-nums'] as TextStyle['fontVariant'];

const dark = {
  bg: '#0A0A0B',
  surface: '#141416',
  surfaceMuted: '#1C1C1F',
  hair: '#26262A',
  hairStrong: '#343439',
  ink: '#F6F5F6',
  inkSecondary: '#A6A5AB',
  inkMuted: '#706F76',
  // the ONE accent — act here: alerts, at-risk money, primary CTA, destructive
  heat: { main: '#FF3D8C', bright: '#FF66A3', soft: '#351320', on: '#0A0A0B' },
};

// Widened on purpose: `dark` defines the *shape*, `light` is a full peer that
// must be assignable to it — `as const` here would pin the type to dark's hexes.
export type ThemeColors = typeof dark;

const light: ThemeColors = {
  bg: '#F7F5F6',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEDEF',
  hair: '#E5E2E5',
  hairStrong: '#D2CFD3',
  ink: '#141316',
  inkSecondary: '#575560',
  inkMuted: '#86848D',
  heat: { main: '#D01166', bright: '#F0367F', soft: '#FEEDF4', on: '#FFFFFF' },
};

// All pairs verified ≥ 4.5:1 for text (3:1 for large/UI) in both themes.
export const colors = { dark, light } as const;

// Weight-driven scale. Money always sets fontVariant tabular-nums so columns align to the digit.
export const type = {
  display: { fontSize: 30, lineHeight: 34, letterSpacing: -0.9, fontWeight: '800' },
  title: { fontSize: 23, lineHeight: 28, letterSpacing: -0.5, fontWeight: '700' },
  heading: { fontSize: 17, lineHeight: 23, letterSpacing: -0.2, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 25, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  money: { fontSize: 16, lineHeight: 20, fontWeight: '700', fontVariant: tabularNums },
  moneyBig: {
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: -1.2,
    fontWeight: '800',
    fontVariant: tabularNums,
  },
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { input: 10, button: 13, card: 18, sheet: 24 } as const;

// Flat, hairline-first. One shadow, only for what truly floats (sheet / FAB / toast).
export const floating = {
  shadowColor: '#000000',
  shadowOpacity: 0.32,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 14 },
  elevation: 8,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
