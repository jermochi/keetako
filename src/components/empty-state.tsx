import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { space, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  art?: ReactNode;
  title: string;
  /** Substring of title rendered in heat (first occurrence) — the mockup's em. */
  accent?: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
};

/** Left-aligned per the mockup — an empty ledger is a statement, not an apology. */
export function EmptyState({ art, title, accent, body, ctaLabel, onCta }: Props) {
  const theme = useTheme();

  let heading: ReactNode = title;
  if (accent && title.includes(accent)) {
    const [before, ...rest] = title.split(accent);
    heading = (
      <>
        {before}
        <Text style={{ color: theme.heat.main }}>{accent}</Text>
        {rest.join(accent)}
      </>
    );
  }

  return (
    <View style={styles.wrap}>
      {art ? <View style={styles.art}>{art}</View> : null}
      <Text style={[styles.title, { color: theme.ink }]}>{heading}</Text>
      <Text style={[styles.body, { color: theme.inkSecondary }]}>{body}</Text>
      {ctaLabel && onCta ? (
        <View style={styles.cta}>
          <Button label={ctaLabel} onPress={onCta} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: space.xl,
    paddingVertical: space.xxl,
    alignItems: 'flex-start',
  },
  art: { marginBottom: space.lg },
  title: { ...type.title, marginBottom: space.sm },
  body: { fontSize: 14, lineHeight: 21, marginBottom: space.xl, maxWidth: 300 },
  cta: { alignSelf: 'stretch' },
});
