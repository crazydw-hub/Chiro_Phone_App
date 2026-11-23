import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import type { Charge, Receipt } from '../types';
import { Button, Card, Muted, Screen, SectionTitle } from '../components/ui';
import { FEES_DUE_NOTE } from '../config/office';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';
import { formatDay } from '../utils/dates';
import { formatMoney } from '../utils/money';

// Balance and demo checkout. NO real card is used or collected here. In the real app, card entry happens on
// the payment processor's own secure page, so card numbers never touch this app or our servers.
export default function PayScreen() {
  const { api, closeOverlay } = useApp();
  const [charges, setCharges] = useState<Charge[] | null>(null);
  const [dueCents, setDueCents] = useState(0);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const b = await api.getBalance();
    setCharges(b.charges);
    setDueCents(b.dueCents);
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  async function pay() {
    setBusy(true);
    try {
      setReceipt(await api.payBalance());
      await load();
    } catch (e) {
      Alert.alert('Payment did not go through', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (receipt) {
    return (
      <Screen title="Payment" onBack={closeOverlay}>
        <Card>
          <SectionTitle>{'✓ Payment received'}</SectionTitle>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.primary }}>{formatMoney(receipt.cents)}</Text>
          <Muted>{`Demo card ending ${receipt.last4}`}</Muted>
          <Muted>{`Receipt ${receipt.id.toUpperCase()}`}</Muted>
          <Button label="Done" onPress={closeOverlay} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="My balance" onBack={closeOverlay}>
      {charges === null && <ActivityIndicator color={colors.primary} />}

      {charges !== null && (
        <Card>
          <Muted>Balance due</Muted>
          <Text style={{ fontSize: 34, fontWeight: '800', color: colors.primary }}>{formatMoney(dueCents)}</Text>
          {FEES_DUE_NOTE ? <Muted>{FEES_DUE_NOTE}</Muted> : null}
        </Card>
      )}

      {(charges ?? []).map((c) => (
        <Card key={c.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 }}>{c.description}</Text>
            <Text style={{ color: c.paid ? colors.success : colors.text, fontWeight: '700' }}>
              {c.paid ? 'Paid' : formatMoney(c.cents)}
            </Text>
          </View>
          <Muted>{formatDay(new Date(c.date))}</Muted>
        </Card>
      ))}

      {charges !== null && charges.length === 0 && <Muted>No charges yet.</Muted>}

      {dueCents > 0 && <Button label={`Pay ${formatMoney(dueCents)} with demo card`} onPress={pay} disabled={busy} />}

      <Muted>
        DEMO ONLY: no real card is used. In the real app, you would enter your card on the payment provider's secure page.
      </Muted>
    </Screen>
  );
}
