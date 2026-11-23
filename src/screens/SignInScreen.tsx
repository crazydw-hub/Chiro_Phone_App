import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ClinicApi } from '../data/api';
import { DEMO_CODE } from '../data/api';
import type { Patient } from '../types';
import { Button, Muted } from '../components/ui';
import { colors, radius, space } from '../theme';

// Passwordless sign-in: the patient enters email/phone, gets a one-time code. No passwords to forget.
export default function SignInScreen({ api, onSignedIn }: { api: ClinicApi; onSignedIn: (p: Patient) => void }) {
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setBusy(true);
    setError(null);
    try {
      await api.requestCode(contact.trim());
      setCodeSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code.');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      onSignedIn(await api.verifyCode(contact.trim(), code.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in.');
      setBusy(false);
    }
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Welcome</Text>
      <Muted>Sign in with your email or phone number. We will send you a code - no password needed.</Muted>

      <TextInput
        style={s.input}
        placeholder="Email or phone number"
        autoCapitalize="none"
        keyboardType="email-address"
        value={contact}
        onChangeText={setContact}
        editable={!codeSent && !busy}
      />

      {codeSent && (
        <>
          <TextInput
            style={s.input}
            placeholder="6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
            editable={!busy}
          />
          <Muted>{`Demo mode: use code ${DEMO_CODE}.`}</Muted>
        </>
      )}

      {error && <Text style={s.error}>{error}</Text>}
      {busy && <ActivityIndicator color={colors.primary} />}

      {!codeSent ? (
        <Button label="Send me a code" onPress={sendCode} disabled={busy || contact.trim().length < 5} />
      ) : (
        <Button label="Sign in" onPress={verify} disabled={busy || code.trim().length !== 6} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: space.lg, gap: space.md, backgroundColor: colors.bg },
  title: { fontSize: 32, fontWeight: '800', color: colors.primary },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    minHeight: 52,
    fontSize: 16,
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 14 },
});
