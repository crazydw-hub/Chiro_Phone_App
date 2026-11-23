import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Service } from '../types';
import { Button, Card, Muted, Screen, SectionTitle } from '../components/ui';
import { FEES_DUE_NOTE, isOpenDay, newPatient, office } from '../config/office';
import { useApp } from '../state/AppContext';
import { colors, radius, space } from '../theme';
import { formatDay, formatTime, formatWhen, nextBookableDays, toDayKey } from '../utils/dates';

// Booking flow: service -> day -> time -> confirm. When rescheduling, the service step is skipped.
export default function BookScreen() {
  const { api, goTab, rescheduling, clearReschedule } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(rescheduling ? rescheduling.serviceId : null);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const days = nextBookableDays(14, isOpenDay);
  const newPatientText = newPatient.examFee
    ? `Please call us to schedule your first visit. The new patient exam is ${newPatient.examFee}${
        newPatient.includes ? ` and includes ${newPatient.includes}` : ''
      }.`
    : 'Please call us to schedule your first visit.';
  const service = services.find((s) => s.id === serviceId) ?? null;

  useEffect(() => {
    api.listServices().then(setServices);
  }, [api]);

  useEffect(() => {
    if (!serviceId || !dayKey) return;
    setSlots(null);
    setSlot(null);
    api.listSlots(serviceId, dayKey, rescheduling?.id).then(setSlots);
  }, [api, serviceId, dayKey, rescheduling]);

  async function confirm() {
    if (!serviceId || !slot) return;
    setBusy(true);
    try {
      if (rescheduling) await api.reschedule(rescheduling.id, slot);
      else await api.book(serviceId, slot);
      clearReschedule();
      goTab('appointments');
    } catch (e) {
      Alert.alert('Could not book', e instanceof Error ? e.message : 'Please try again.');
      setBusy(false);
    }
  }

  function cancelReschedule() {
    clearReschedule();
    goTab('appointments');
  }

  return (
    <Screen title={rescheduling ? 'Reschedule visit' : 'Book a visit'}>
      {rescheduling && (
        <Card>
          <Muted>{`Current time: ${formatWhen(rescheduling.startsAt)}`}</Muted>
          <Button label="Never mind" variant="secondary" onPress={cancelReschedule} />
        </Card>
      )}

      {!rescheduling && newPatient.mode === 'call' && (
        <Card>
          <SectionTitle>New patient?</SectionTitle>
          <Muted>{newPatientText}</Muted>
          <Button label={`Call ${office.phoneDisplay}`} variant="secondary" onPress={() => Linking.openURL(office.phoneLink)} />
        </Card>
      )}

      {!rescheduling && (
        <>
          <SectionTitle>1. What kind of visit?</SectionTitle>
          {services.map((svc) => (
            <Pressable key={svc.id} onPress={() => { setServiceId(svc.id); setDayKey(null); setSlot(null); }}>
              <Card>
                <Text style={[s.optionTitle, serviceId === svc.id && s.selectedText]}>
                  {serviceId === svc.id ? '✓ ' : ''}{svc.name}
                </Text>
                <Muted>{`${svc.minutes} min - ${svc.description}`}</Muted>
                {svc.feeNote && <Muted>{svc.feeNote}</Muted>}
              </Card>
            </Pressable>
          ))}
        </>
      )}

      {service && (
        <>
          <SectionTitle>{rescheduling ? 'Pick a new day' : '2. Pick a day'}</SectionTitle>
          <View style={s.chipRow}>
            {days.map((d) => {
              const key = toDayKey(d);
              const selected = key === dayKey;
              return (
                <Pressable key={key} onPress={() => setDayKey(key)} style={[s.chip, selected && s.chipSelected]}>
                  <Text style={[s.chipText, selected && s.chipTextSelected]}>{formatDay(d)}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {service && dayKey && (
        <>
          <SectionTitle>{rescheduling ? 'Pick a new time' : '3. Pick a time'}</SectionTitle>
          {slots === null && <ActivityIndicator color={colors.primary} />}
          {slots !== null && slots.length === 0 && <Muted>No openings that day. Try another day.</Muted>}
          <View style={s.chipRow}>
            {(slots ?? []).map((iso) => {
              const selected = iso === slot;
              return (
                <Pressable key={iso} onPress={() => setSlot(iso)} style={[s.chip, selected && s.chipSelected]}>
                  <Text style={[s.chipText, selected && s.chipTextSelected]}>{formatTime(new Date(iso))}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {service && slot && (
        <Card>
          <SectionTitle>Confirm</SectionTitle>
          <Text style={s.optionTitle}>{formatWhen(slot)}</Text>
          <Muted>{`${service.name} - ${service.minutes} min`}</Muted>
          {FEES_DUE_NOTE ? <Muted>{FEES_DUE_NOTE}</Muted> : null}
          <Button label={rescheduling ? 'Confirm new time' : 'Confirm booking'} onPress={confirm} disabled={busy} />
        </Card>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  optionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  selectedText: { color: colors.primary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 15 },
  chipTextSelected: { color: colors.onPrimary, fontWeight: '600' },
});
