import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = strings.auth.signIn;

  async function onSubmit() {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError(t.invalidEmail);
      return;
    }

    setSubmitting(true);
    setError(null);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { shouldCreateUser: true },
    });
    setSubmitting(false);

    if (otpError) {
      setError(t.genericError);
      return;
    }

    router.push({ pathname: '/verify', params: { email: trimmed } });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>{t.title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t.subtitle}</Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>{t.emailLabel}</Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.backgroundElement },
            ]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null);
            }}
            placeholder={t.emailPlaceholder}
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            inputMode="email"
            editable={!submitting}
            onSubmitEditing={onSubmit}
            returnKeyType="send"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, { backgroundColor: theme.text }, submitting && styles.disabled]}
            onPress={onSubmit}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.background }]}>{t.submit}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 15, marginBottom: Spacing.three },
  label: { fontSize: 13, marginTop: Spacing.two },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  error: { color: '#E5484D', fontSize: 13 },
  button: {
    marginTop: Spacing.three,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
