import React, { createContext, useContext } from 'react';
import type { ClinicApi } from '../data/api';
import type { Appointment, Overlay, Patient, Tab } from '../types';

type AppState = {
  api: ClinicApi;
  patient: Patient;
  signOut: () => void;
  tab: Tab;
  goTab: (tab: Tab) => void;
  /** When set, the Book screen reschedules this appointment instead of creating a new one. */
  rescheduling: Appointment | null;
  startReschedule: (appt: Appointment) => void;
  clearReschedule: () => void;
  /** A full-screen page (forms, payment, front-desk preview) shown over the tabs. */
  overlay: Overlay | null;
  openOverlay: (o: Overlay) => void;
  closeOverlay: () => void;
};

const AppContext = createContext<AppState | null>(null);

export const AppProvider = AppContext.Provider;

export function useApp(): AppState {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
