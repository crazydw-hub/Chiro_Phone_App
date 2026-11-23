import React from 'react';
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { colors, radius, space } from '../theme';

// Android draws under the status bar on newer versions, so pad the top manually.
// (Later: swap for react-native-safe-area-context.)
const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

export function Screen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function Button({ label, onPress, disabled, variant = 'primary' }: ButtonProps) {
  const bg = variant === 'primary' ? colors.primary : colors.bg;
  const fg = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.primary;
  const border = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: '#00000022' }}
      style={[styles.button, { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.primary,
    paddingTop: statusBarHeight + space.md,
    paddingBottom: space.md,
    paddingHorizontal: space.md,
  },
  headerText: { color: colors.onPrimary, fontSize: 22, fontWeight: '700' },
  content: { padding: space.md, gap: space.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  muted: { color: colors.muted, fontSize: 14 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
});
