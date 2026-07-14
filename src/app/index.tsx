import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{strings.app.name}</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>{strings.app.tagline}</Text>
        <Text style={[styles.placeholder, { color: theme.textSecondary }]}>
          {strings.home.placeholder}
        </Text>

        {/* Temporary — replaced by the Settings tab in M10. */}
        <Pressable
          style={[styles.signOut, { borderColor: theme.backgroundSelected }]}
          onPress={() => supabase.auth.signOut()}>
          <Text style={[styles.signOutText, { color: theme.text }]}>{strings.home.signOut}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 13,
  },
  signOut: {
    marginTop: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
