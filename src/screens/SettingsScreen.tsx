import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, Muted, Screen, SectionTitle } from '../components/ui';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';

export default function SettingsScreen() {
  const { patient, signOut } = useApp();
  // Placeholder only: real push reminders come with the notifications module.
  const [reminders, setReminders] = useState(true);

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

      <Button label="Sign out" variant="secondary" onPress={signOut} />
      <Muted>Version 0.1 (bones)</Muted>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  value: { fontSize: 16, color: colors.text, fontWeight: '600' },
});
