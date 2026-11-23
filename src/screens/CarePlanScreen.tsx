import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '../types';
import { Card, Muted, Screen, SectionTitle } from '../components/ui';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';

// Home exercises prescribed by the doctor. The reason to open the app between visits.
export default function CarePlanScreen() {
  const { api } = useApp();
  const [items, setItems] = useState<Exercise[] | null>(null);

  const load = useCallback(async () => setItems(await api.listExercises()), [api]);
  useEffect(() => {
    load();
  }, [load]);

  async function toggle(ex: Exercise) {
    setItems((prev) => (prev ? prev.map((e) => (e.id === ex.id ? { ...e, doneToday: !e.doneToday } : e)) : prev));
    await api.setExerciseDone(ex.id, !ex.doneToday);
  }

  const done = (items ?? []).filter((e) => e.doneToday).length;
  const total = (items ?? []).length;

  return (
    <Screen title="My care plan">
      {items === null && <ActivityIndicator color={colors.primary} />}
      {items !== null && (
        <Card>
          <SectionTitle>Today</SectionTitle>
          <Muted>{`${done} of ${total} exercises done`}</Muted>
        </Card>
      )}
      {(items ?? []).map((ex) => (
        <Pressable key={ex.id} onPress={() => toggle(ex)} accessibilityRole="checkbox" accessibilityState={{ checked: ex.doneToday }}>
          <Card>
            <View style={s.row}>
              <View style={[s.box, ex.doneToday && s.boxChecked]}>
                {ex.doneToday && <Text style={s.tick}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{ex.title}</Text>
                <Muted>{ex.dosage}</Muted>
              </View>
            </View>
            <Muted>{ex.instructions}</Muted>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  box: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.primary },
  tick: { color: colors.onPrimary, fontWeight: '800' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
});
