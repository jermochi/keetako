import { useLocalSearchParams } from 'expo-router';
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

const CODE_RE = /^\d{6}$/;

export default function VerifyScreen() {
  const theme = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = strings.auth.verify;

  async function onVerify() {
    if (!CODE_RE.test(code)) {
      setError(t.invalidCode);
      return;
    }

    setSubmitting(true);
    setError(null);
    // On success the root layout's auth listener redirects to the app.
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    setSubmitting(false);

    if (verifyError) {
      setError(t.genericError);
    }
  }

  async function onResend() {
    setResending(true);
    setError(null);
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setResending(false);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>{t.title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t.subtitle} {email}
          </Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>{t.codeLabel}</Text>
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
            value={code}
            onChangeText={(text) => {
              setCode(text.replace(/\D/g, '').slice(0, 6));
              if (error) setError(null);
            }}
            placeholder={t.codePlaceholder}
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={6}
            editable={!submitting}
            onSubmitEditing={onVerify}
            returnKeyType="done"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, { backgroundColor: theme.text }, submitting && styles.disabled]}
            onPress={onVerify}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.background }]}>{t.submit}</Text>
            )}
          </Pressable>

          <Pressable onPress={onResend} disabled={resending} style={styles.resend}>
            <Text style={[styles.resendText, { color: theme.textSecondary }]}>{t.resend}</Text>
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
    fontSize: 20,
    letterSpacing: 4,
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
  resend: { marginTop: Spacing.three, alignItems: 'center' },
  resendText: { fontSize: 14 },
});
