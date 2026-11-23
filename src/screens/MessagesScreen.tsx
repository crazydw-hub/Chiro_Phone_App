import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Message } from '../types';
import { Chip, Header, Muted } from '../components/ui';
import { practice } from '../practice/active';
import { useApp } from '../state/AppContext';
import { colors, radius, space } from '../theme';
import { formatDay, formatTime } from '../utils/dates';

// Simple thread with the office. The mock polls every 2 seconds; a real backend would push new messages.
export default function MessagesScreen() {
  const { api } = useApp();
  const [items, setItems] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scroller = useRef<any>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const m = await api.listMessages();
      if (alive) setItems(m);
    };
    load();
    const timer = setInterval(load, 2000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [api]);

  useEffect(() => {
    scroller.current?.scrollToEnd?.({ animated: true });
  }, [items.length]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.sendMessage(text);
      setDraft('');
      setItems(await api.listMessages());
    } catch (e) {
      Alert.alert('Could not send', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Messages" />
      <ScrollView ref={scroller} contentContainerStyle={s.list}>
        <Muted>
          For non-urgent questions only. In an emergency call 911. Please do not send detailed health information here.
        </Muted>
        {items.map((m, i) => {
          const mine = m.from === 'patient';
          const newDay = i === 0 || formatDay(new Date(items[i - 1].sentAt)) !== formatDay(new Date(m.sentAt));
          return (
            <View key={m.id} style={{ gap: 6 }}>
              {newDay && <Text style={s.day}>{formatDay(new Date(m.sentAt))}</Text>}
              <View style={[s.bubble, mine ? s.mine : s.theirs]}>
                <Text style={[s.text, mine && { color: colors.onPrimary }]}>{m.text}</Text>
                <Text style={[s.time, mine && { color: colors.onPrimary }]}>
                  {`${m.auto ? 'Automatic - ' : ''}${formatTime(new Date(m.sentAt))}`}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {practice.quickReplies.length > 0 && (
        <View style={s.quick}>
          {practice.quickReplies.map((q) => (
            <Chip key={q} label={q} selected={false} onPress={() => send(q)} />
          ))}
        </View>
      )}

      <View style={s.inputBar}>
        <TextInput
          style={s.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message"
          placeholderTextColor={colors.muted}
          multiline
        />
        <Pressable
          onPress={() => send(draft)}
          disabled={sending || !draft.trim()}
          accessibilityRole="button"
          style={[s.sendBtn, { opacity: sending || !draft.trim() ? 0.5 : 1 }]}
        >
          <Text style={s.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  list: { padding: space.md, gap: space.sm },
  day: { alignSelf: 'center', color: colors.muted, fontSize: 12, marginTop: space.sm },
  bubble: { maxWidth: '82%', borderRadius: radius.md, padding: space.md, gap: 4 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  text: { color: colors.text, fontSize: 16 },
  time: { color: colors.muted, fontSize: 11 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: space.md, paddingBottom: space.sm },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    padding: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    fontSize: 16,
    color: colors.text,
  },
  sendBtn: {
    minHeight: 46,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
});
