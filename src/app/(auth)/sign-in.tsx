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
import { radius, space } from '@/constants/theme';
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.ink }]}>{t.title}</Text>
          <Text style={[styles.subtitle, { color: theme.inkSecondary }]}>{t.subtitle}</Text>

          <Text style={[styles.label, { color: theme.inkSecondary }]}>{t.emailLabel}</Text>
          <TextInput
            style={[styles.input, { color: theme.ink, backgroundColor: theme.surfaceMuted }]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null);
            }}
            placeholder={t.emailPlaceholder}
            placeholderTextColor={theme.inkMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            inputMode="email"
            editable={!submitting}
            onSubmitEditing={onSubmit}
            returnKeyType="send"
          />

          {error ? (
            <Text style={[styles.error, { color: theme.heat.main }]}>{error}</Text>
          ) : null}

          <Pressable
            style={[
              styles.button,
              { backgroundColor: theme.heat.main },
              submitting && styles.disabled,
            ]}
            onPress={onSubmit}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={theme.heat.on} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.heat.on }]}>{t.submit}</Text>
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
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginBottom: space.lg },
  label: { fontSize: 13, marginTop: space.sm, fontWeight: '500' },
  input: {
    borderRadius: radius.input,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    fontSize: 16,
  },
  error: { fontSize: 13, fontWeight: '600' },
  button: {
    marginTop: space.lg,
    borderRadius: radius.button,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
