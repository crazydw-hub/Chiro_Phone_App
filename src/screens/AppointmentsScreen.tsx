import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Text, View } from 'react-native';
import type { Appointment, IntakeForm, Service } from '../types';
import { Button, Card, Muted, Screen, SectionTitle, styles } from '../components/ui';
import { CHANGE_NOTICE_HOURS, canChangeOnline, canCheckIn, describeHours, office } from '../config/office';
import { practice } from '../practice/active';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';
import { formatTime, formatWhen } from '../utils/dates';
import { formatMoney } from '../utils/money';

export default function AppointmentsScreen() {
  const { api, goTab, startReschedule, openOverlay } = useApp();
  const [items, setItems] = useState<Appointment[] | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [intake, setIntake] = useState<IntakeForm | null>(null);
  const [dueCents, setDueCents] = useState<number | null>(null);

  const f = practice.features;

  const load = useCallback(async () => {
    const [a, s] = await Promise.all([api.listAppointments(), api.listServices()]);
    setItems(a);
    setServices(s);
    if (f.intakeForms) setIntake(await api.getIntake());
    if (f.payments) setDueCents((await api.getBalance()).dueCents);
  }, [api, f.intakeForms, f.payments]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep a visit on the list until an hour after it starts, so a patient can still check in.
  const cutoff = Date.now() - 60 * 60000;
  const upcoming = (items ?? [])
    .filter((a) => a.status === 'booked' && new Date(a.startsAt).getTime() >= cutoff)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  function confirmCancel(appt: Appointment) {
    Alert.alert('Cancel this appointment?', formatWhen(appt.startsAt), [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel appointment',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.cancel(appt.id);
          } catch (e) {
            Alert.alert('Could not cancel', e instanceof Error ? e.message : 'Please call the office.');
          }
          load();
        },
      },
    ]);
  }

  async function checkIn(appt: Appointment) {
    try {
      await api.checkIn(appt.id);
    } catch (e) {
      Alert.alert('Could not check in', e instanceof Error ? e.message : 'Please tell the front desk.');
    }
    load();
  }

  const callOffice = () => Linking.openURL(office.phoneLink);

  return (
    <Screen title="My appointments">
      {items === null && <ActivityIndicator color={colors.primary} />}

      {items !== null && upcoming.length === 0 && (
        <Card>
          <SectionTitle>No upcoming visits</SectionTitle>
          <Muted>Book your next visit in a few taps.</Muted>
          <Button label="Book a visit" onPress={() => goTab('book')} />
        </Card>
      )}

      {upcoming.map((appt) => {
        const service = services.find((s) => s.id === appt.serviceId);
        const changeable = canChangeOnline(appt.startsAt);
        const arrived = Boolean(appt.checkedInAt);
        const checkInOpen = f.checkIn && !arrived && canCheckIn(appt.startsAt);
        return (
          <Card key={appt.id}>
            <Text style={styles.sectionTitle}>{formatWhen(appt.startsAt)}</Text>
            <Muted>{service ? `${service.name} - ${service.minutes} min` : 'Visit'}</Muted>

            {arrived && appt.checkedInAt && (
              <Text style={{ color: colors.success, fontWeight: '700' }}>
                {`✓ You're checked in (${formatTime(new Date(appt.checkedInAt))}). Please have a seat - we'll call you in.`}
              </Text>
            )}
            {checkInOpen && <Button label="I'm here" onPress={() => checkIn(appt)} />}

            {!arrived && changeable && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Button label="Reschedule" variant="secondary" onPress={() => startReschedule(appt)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label="Cancel" variant="danger" onPress={() => confirmCancel(appt)} />
                </View>
              </View>
            )}
            {!arrived && !changeable && !checkInOpen && (
              <>
                <Muted>{`Changes within ${CHANGE_NOTICE_HOURS} hours of a visit need a call to the office.`}</Muted>
                <Button label={`Call ${office.phoneDisplay}`} variant="secondary" onPress={callOffice} />
              </>
            )}
          </Card>
        );
      })}

      {upcoming.length > 0 && <Button label="Book another visit" onPress={() => goTab('book')} />}

      {f.intakeForms && intake && (
        <Card>
          <SectionTitle>New patient forms</SectionTitle>
          {intake.status === 'submitted' ? (
            <Muted>{'✓ Submitted. Nothing to fill out when you arrive.'}</Muted>
          ) : (
            <>
              <Muted>
                {intake.status === 'in_progress'
                  ? 'You have started your paperwork. Finish it before your visit.'
                  : 'Fill out your paperwork on your phone before you arrive.'}
              </Muted>
              <Button
                label={intake.status === 'in_progress' ? 'Continue forms' : 'Start forms'}
                variant="secondary"
                onPress={() => openOverlay('intake')}
              />
            </>
          )}
        </Card>
      )}

      {f.payments && dueCents !== null && (
        <Card>
          <SectionTitle>Balance</SectionTitle>
          {dueCents > 0 ? (
            <>
              <Text style={styles.sectionTitle}>{`${formatMoney(dueCents)} due`}</Text>
              <Button label="View and pay" variant="secondary" onPress={() => openOverlay('pay')} />
            </>
          ) : (
            <>
              <Muted>No balance due.</Muted>
              <Button label="View history" variant="secondary" onPress={() => openOverlay('pay')} />
            </>
          )}
        </Card>
      )}

      <Card>
        <SectionTitle>{office.name}</SectionTitle>
        {describeHours().map((line) => (
          <Muted key={line}>{line}</Muted>
        ))}
        <Button label={`Call ${office.phoneDisplay}`} variant="secondary" onPress={callOffice} />
      </Card>
    </Screen>
  );
}
