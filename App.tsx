import React, { useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { mockApi } from './src/data/api';
import { AppProvider } from './src/state/AppContext';
import type { Appointment, Overlay, Patient, Tab } from './src/types';
import SignInScreen from './src/screens/SignInScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import BookScreen from './src/screens/BookScreen';
import CarePlanScreen from './src/screens/CarePlanScreen';
import FrontDeskScreen from './src/screens/FrontDeskScreen';
import IntakeScreen from './src/screens/IntakeScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import PayScreen from './src/screens/PayScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { practice } from './src/practice/active';
import { colors, space } from './src/theme';

// The one place that chooses the backend. Swap mockApi for a real implementation later.
const api = mockApi;

// Tabs follow the practice's feature switches (src/practice/*.ts).
const f = practice.features;
const TABS: { key: Tab; label: string }[] = [
  { key: 'appointments', label: 'Visits' },
  { key: 'book', label: 'Book' },
  ...(f.messaging ? [{ key: 'messages' as Tab, label: 'Messages' }] : []),
  ...(f.carePlan ? [{ key: 'care' as Tab, label: 'Care plan' }] : []),
  { key: 'settings', label: 'Settings' },
];

export default function App() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tab, setTab] = useState<Tab>('appointments');
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);
  const [overlay, setOverlay] = useState<Overlay | null>(null);

  // Android back button closes a full-screen page first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (overlay) {
        setOverlay(null);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [overlay]);

  const ctx = useMemo(
    () =>
      patient
        ? {
            api,
            patient,
            signOut: () => {
              setPatient(null);
              setTab('appointments');
              setRescheduling(null);
              setOverlay(null);
            },
            tab,
            goTab: setTab,
            rescheduling,
            startReschedule: (appt: Appointment) => {
              setRescheduling(appt);
              setTab('book');
            },
            clearReschedule: () => setRescheduling(null),
            overlay,
            openOverlay: setOverlay,
            closeOverlay: () => setOverlay(null),
          }
        : null,
    [patient, tab, rescheduling, overlay],
  );

  if (!patient || !ctx) {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SignInScreen api={api} onSignedIn={setPatient} />
      </>
    );
  }

  return (
    <AppProvider value={ctx}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.root}>
        <View style={styles.body}>
          {overlay === 'intake' && <IntakeScreen />}
          {overlay === 'pay' && <PayScreen />}
          {overlay === 'frontdesk' && <FrontDeskScreen />}
          {/* Only the active screen is mounted, so each visit to a tab loads fresh data. */}
          {!overlay && tab === 'appointments' && <AppointmentsScreen />}
          {!overlay && tab === 'book' && <BookScreen />}
          {!overlay && tab === 'messages' && f.messaging && <MessagesScreen />}
          {!overlay && tab === 'care' && f.carePlan && <CarePlanScreen />}
          {!overlay && tab === 'settings' && <SettingsScreen />}
        </View>
        {!overlay && (
          <View style={styles.tabBar}>
            {TABS.map((t) => (
              <Pressable
                key={t.key}
                style={styles.tab}
                onPress={() => {
                  // Leaving the Book tab abandons any reschedule in progress.
                  if (t.key !== 'book') setRescheduling(null);
                  setTab(t.key);
                }}
                accessibilityRole="tab"
              >
                <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    paddingBottom: space.lg, // room for the Android gesture bar; replace with safe-area insets later
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: space.md },
  tabText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
});
