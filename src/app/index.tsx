import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '@/constants/strings';
import { radius, space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.ink }]}>{strings.app.name}</Text>
        <Text style={[styles.tagline, { color: theme.inkSecondary }]}>{strings.app.tagline}</Text>
        <Text style={[styles.placeholder, { color: theme.inkSecondary }]}>
          {strings.home.placeholder}
        </Text>

        {/* Temporary — replaced by the Settings tab in M10. */}
        <Pressable
          style={[styles.signOut, { borderColor: theme.hairStrong }]}
          onPress={() => supabase.auth.signOut()}>
          <Text style={[styles.signOutText, { color: theme.ink }]}>{strings.home.signOut}</Text>
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
    paddingHorizontal: space.xl,
    gap: space.lg,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 13,
  },
  signOut: {
    marginTop: space.xl,
    borderWidth: 1,
    borderRadius: radius.button,
    paddingVertical: space.sm,
    paddingHorizontal: space.xl,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
