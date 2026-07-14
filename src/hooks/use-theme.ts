/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  // Dark is the flagship theme — it's also the fallback when the scheme is unknown.
  const theme = scheme === 'unspecified' ? 'dark' : scheme;

  return colors[theme];
}
