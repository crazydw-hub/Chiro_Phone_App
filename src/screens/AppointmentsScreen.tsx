import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Text, View } from 'react-native';
import type { Appointment, Service } from '../types';
import { Button, Card, Muted, Screen, SectionTitle, styles } from '../components/ui';
import { CHANGE_NOTICE_HOURS, canChangeOnline, describeHours, office } from '../config/office';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';
import { formatWhen } from '../utils/dates';

export default function AppointmentsScreen() {
  const { api, goTab, startReschedule } = useApp();
  const [items, setItems] = useState<Appointment[] | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const load = useCallback(async () => {
    const [a, s] = await Promise.all([api.listAppointments(), api.listServices()]);
    setItems(a);
    setServices(s);
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const now = Date.now();
  const upcoming = (items ?? [])
    .filter((a) => a.status === 'booked' && new Date(a.startsAt).getTime() >= now)
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
        return (
          <Card key={appt.id}>
            <Text style={styles.sectionTitle}>{formatWhen(appt.startsAt)}</Text>
            <Muted>{service ? `${service.name} - ${service.minutes} min` : 'Visit'}</Muted>
            {changeable ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Button label="Reschedule" variant="secondary" onPress={() => startReschedule(appt)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label="Cancel" variant="danger" onPress={() => confirmCancel(appt)} />
                </View>
              </View>
            ) : (
              <>
                <Muted>{`Changes within ${CHANGE_NOTICE_HOURS} hours of a visit need a call to the office.`}</Muted>
                <Button label={`Call ${office.phoneDisplay}`} variant="secondary" onPress={callOffice} />
              </>
            )}
          </Card>
        );
      })}

      {upcoming.length > 0 && <Button label="Book another visit" onPress={() => goTab('book')} />}

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
