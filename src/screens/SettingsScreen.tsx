import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, Muted, Screen, SectionTitle } from '../components/ui';
import { practice } from '../practice/active';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';

export default function SettingsScreen() {
  const { api, patient, signOut, openOverlay } = useApp();
  // Placeholder only: real push reminders come with the notifications module.
  const [reminders, setReminders] = useState(true);
  const f = practice.features;
  const demo = api.demo;

  async function run(action: () => Promise<void>, done: string) {
    await action();
    Alert.alert('Demo', done);
  }

  return (
    <Screen title="Settings">
      <Card>
        <SectionTitle>Signed in</SectionTitle>
        <Text style={s.value}>{patient.contact}</Text>
      </Card>

      <Card>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.value}>Appointment reminders</Text>
            <Muted>Coming soon - this switch does not do anything yet.</Muted>
          </View>
          <Switch value={reminders} onValueChange={setReminders} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      {demo && (
        <Card>
          <SectionTitle>Demo tools</SectionTitle>
          <Muted>Only in the demo build. These stage situations so each feature can be shown.</Muted>
          {f.checkIn && (
            <Button
              label="Add a visit starting in 20 minutes"
              variant="secondary"
              onPress={() => run(demo.addVisitSoon, 'Added. Open the Visits tab to see the "I\'m here" button.')}
            />
          )}
          {f.payments && (
            <Button
              label="Add a demo charge ($25.00)"
              variant="secondary"
              onPress={() => run(demo.addCharge, 'Added. Open the Visits tab, then Balance.')}
            />
          )}
          {f.messaging && (
            <Button
              label="Simulate a reply from the office"
              variant="secondary"
              onPress={() => run(demo.officeReply, 'The office replied. Check the Messages tab.')}
            />
          )}
          <Button label="Open front-desk preview" variant="secondary" onPress={() => openOverlay('frontdesk')} />
        </Card>
      )}

      <Button label="Sign out" variant="secondary" onPress={signOut} />
      <Muted>Version 0.2 (demo modules)</Muted>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  value: { fontSize: 16, color: colors.text, fontWeight: '600' },
});
