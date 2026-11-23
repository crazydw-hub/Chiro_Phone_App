import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { IntakeForm } from '../types';
import { Button, Card, CheckRow, Chip, Field, Muted, Screen, SectionTitle } from '../components/ui';
import { practice } from '../practice/active';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';

const AREAS = ['Neck', 'Upper back', 'Low back', 'Shoulder', 'Hip', 'Knee', 'Headaches', 'Other'];
const STEP_TITLES = ['About you', 'Why you are visiting', 'Your history', 'Review and sign'];

// New-patient paperwork on the phone. Demo only: real forms must follow the practice's own paperwork
// and be stored with a HIPAA-compliant backend.
export default function IntakeScreen() {
  const { api, closeOverlay } = useApp();
  const [form, setForm] = useState<IntakeForm | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getIntake().then(setForm);
  }, [api]);

  if (!form) {
    return (
      <Screen title="New patient forms" onBack={closeOverlay}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (form.status === 'submitted') {
    return (
      <Screen title="New patient forms" onBack={closeOverlay}>
        <Card>
          <SectionTitle>{'✓ Forms submitted'}</SectionTitle>
          <Muted>{`Thank you, ${form.fullName}. ${practice.name} has your paperwork, so you can skip the clipboard when you arrive.`}</Muted>
          <Button label="Done" onPress={closeOverlay} />
        </Card>
      </Screen>
    );
  }

  const current: IntakeForm = form;

  function set<K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) {
    setForm({ ...current, [key]: value });
  }

  function toggleArea(area: string) {
    set('areas', current.areas.includes(area) ? current.areas.filter((a) => a !== area) : [...current.areas, area]);
  }

  function problem(): string | null {
    if (step === 0 && (!current.fullName.trim() || !current.dob.trim())) return 'Please enter your name and date of birth.';
    if (step === 1 && !current.reason.trim()) return 'Please tell us briefly why you are visiting.';
    if (step === 3 && (!current.consent || !current.signature.trim())) return 'Please accept and type your name to sign.';
    return null;
  }

  async function next() {
    const p = problem();
    setError(p);
    if (p) return;
    await api.saveIntake(current); // progress is saved at every step
    setStep(step + 1);
  }

  async function submit() {
    const p = problem();
    setError(p);
    if (p) return;
    setBusy(true);
    try {
      setForm(await api.submitIntake(current));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="New patient forms" onBack={closeOverlay}>
      <Muted>{`Step ${step + 1} of ${STEP_TITLES.length}: ${STEP_TITLES[step]}`}</Muted>

      {step === 0 && (
        <Card>
          <Field label="Full name" value={current.fullName} onChangeText={(t) => set('fullName', t)} />
          <Field label="Date of birth" value={current.dob} onChangeText={(t) => set('dob', t)} placeholder="MM/DD/YYYY" keyboardType="number-pad" />
          <Field label="Phone" value={current.phone} onChangeText={(t) => set('phone', t)} keyboardType="phone-pad" />
          <Field label="Email" value={current.email} onChangeText={(t) => set('email', t)} keyboardType="email-address" />
        </Card>
      )}

      {step === 1 && (
        <Card>
          <Field label="What brings you in?" value={current.reason} onChangeText={(t) => set('reason', t)} multiline />
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>Where does it bother you?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {AREAS.map((a) => (
              <Chip key={a} label={a} selected={current.areas.includes(a)} onPress={() => toggleArea(a)} />
            ))}
          </View>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>Have you seen a chiropractor before?</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="Yes" selected={current.priorChiro === 'yes'} onPress={() => set('priorChiro', 'yes')} />
            <Chip label="No" selected={current.priorChiro === 'no'} onPress={() => set('priorChiro', 'no')} />
          </View>
          <Field label="Anything else we should know?" value={current.notes} onChangeText={(t) => set('notes', t)} multiline />
          <Muted>The doctor will go over your health history with you in person.</Muted>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <SectionTitle>Please review</SectionTitle>
          <Muted>{`${current.fullName} - born ${current.dob}`}</Muted>
          <Muted>{`Reason: ${current.reason}`}</Muted>
          {current.areas.length > 0 && <Muted>{`Areas: ${current.areas.join(', ')}`}</Muted>}
          <CheckRow
            label={`I have read and received ${practice.name}'s policies and confirm the information above is correct.`}
            checked={current.consent}
            onPress={() => set('consent', !current.consent)}
          />
          <Field label="Type your full name to sign" value={current.signature} onChangeText={(t) => set('signature', t)} />
        </Card>
      )}

      {error && <Text style={{ color: colors.danger }}>{error}</Text>}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {step > 0 && (
          <View style={{ flex: 1 }}>
            <Button label="Back" variant="secondary" onPress={() => { setError(null); setStep(step - 1); }} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          {step < STEP_TITLES.length - 1 ? (
            <Button label="Next" onPress={next} />
          ) : (
            <Button label="Submit forms" onPress={submit} disabled={busy} />
          )}
        </View>
      </View>
    </Screen>
  );
}
