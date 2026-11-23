import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import type { FrontDeskView } from '../types';
import { Card, Muted, Screen, SectionTitle } from '../components/ui';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';
import { formatTime } from '../utils/dates';
import { formatMoney } from '../utils/money';

// Preview of what the office would see when a patient uses the app. Demo only: the real front-desk
// screen will be its own web page, built after the backend exists.
export default function FrontDeskScreen() {
  const { api, closeOverlay } = useApp();
  const [view, setView] = useState<FrontDeskView | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!api.demo) return;
      const v = await api.demo.frontDesk();
      if (alive) setView(v);
    };
    load();
    const timer = setInterval(load, 2000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [api]);

  return (
    <Screen title="Front desk (demo preview)" onBack={closeOverlay}>
      <Muted>What the office would see, updating live. A preview only: the real staff screen comes later.</Muted>
      {view === null && <ActivityIndicator color={colors.primary} />}

      {view && (
        <>
          <Card>
            <SectionTitle>Arrivals</SectionTitle>
            {view.arrivals.length === 0 && <Muted>No one has checked in.</Muted>}
            {view.arrivals.map((a) => (
              <Muted key={a.appointmentId}>{`${a.serviceName} - arrived ${formatTime(new Date(a.checkedInAt))}`}</Muted>
            ))}
          </Card>

          <Card>
            <SectionTitle>{`Messages (${view.unreadCount} waiting for a reply)`}</SectionTitle>
            {view.patientMessages.length === 0 && <Muted>No patient messages.</Muted>}
            {view.patientMessages.map((m) => (
              <Muted key={m.id}>{`${formatTime(new Date(m.sentAt))}: ${m.text}`}</Muted>
            ))}
          </Card>

          <Card>
            <SectionTitle>New patient forms</SectionTitle>
            <Muted>
              {view.intake.status === 'submitted'
                ? `Submitted by ${view.intake.fullName}`
                : view.intake.status === 'in_progress'
                ? 'In progress'
                : 'Not started'}
            </Muted>
          </Card>

          <Card>
            <SectionTitle>Payments</SectionTitle>
            {view.payments.length === 0 && <Muted>No payments yet.</Muted>}
            {view.payments.map((p) => (
              <Muted key={p.id}>{`${formatMoney(p.cents)} at ${formatTime(new Date(p.paidAt))} (demo card)`}</Muted>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}
