import { CHANGE_NOTICE_HOURS, SLOT_STEP_MINUTES, canChangeOnline, hours, office, services } from '../config/office';
import type { Appointment, Exercise, Patient, Service } from '../types';
import { fromDayKey } from '../utils/dates';

/**
 * Everything the app needs from a backend goes through this interface.
 * Today it is backed by in-memory mock data. Later we write a second implementation
 * (Supabase or similar) and swap it in one place - screens do not change.
 * Office-specific facts (services, hours, fees, change window) come from src/config/office.ts.
 */
export interface ClinicApi {
  requestCode(contact: string): Promise<void>;
  verifyCode(contact: string, code: string): Promise<Patient>;

  listServices(): Promise<Service[]>;
  listAppointments(): Promise<Appointment[]>;
  /** Open start times (ISO) for a service on a local day (YYYY-MM-DD). */
  listSlots(serviceId: string, dayKey: string, ignoreAppointmentId?: string): Promise<string[]>;
  book(serviceId: string, startsAt: string): Promise<Appointment>;
  reschedule(appointmentId: string, startsAt: string): Promise<Appointment>;
  cancel(appointmentId: string): Promise<void>;

  listExercises(): Promise<Exercise[]>;
  setExerciseDone(exerciseId: string, done: boolean): Promise<void>;
}

export const DEMO_CODE = '123456';

// ---------------------------------------------------------------------------------------------
// Mock implementation. Exercises are placeholders - the real ones come from the doctor.
// ---------------------------------------------------------------------------------------------

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const exercises: Exercise[] = [
  { id: 'e1', title: 'Cat-camel stretch', instructions: 'On hands and knees, slowly arch then round your back.', dosage: '2 x 10 reps', doneToday: false },
  { id: 'e2', title: 'Knee-to-chest', instructions: 'Lying on your back, pull one knee toward your chest and hold.', dosage: '3 x 30 sec each side', doneToday: false },
  { id: 'e3', title: 'Chin tucks', instructions: 'Sit tall and gently draw your chin straight back.', dosage: '2 x 10 reps', doneToday: false },
];

const appointments: Appointment[] = [];
let nextId = 1;

// One sample upcoming visit, on the first open day at least 3 days away, at 10:00.
function seedAppointment() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  while (hours[d.getDay()].length === 0) d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  appointments.push({ id: `a${nextId++}`, serviceId: 'adjust', startsAt: d.toISOString(), status: 'booked' });
}
seedAppointment();

// Cheap deterministic "already booked by someone else" so the slot list looks realistic.
function takenByOthers(dayKey: string, hour: number, minute: number): boolean {
  let h = 0;
  const s = `${dayKey}-${hour}-${minute}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
  return h % 4 === 0;
}

function changeBlockedError(): Error {
  return new Error(
    `Visits can be changed in the app up to ${CHANGE_NOTICE_HOURS} hours ahead. Please call the office at ${office.phoneDisplay}.`,
  );
}

export const mockApi: ClinicApi = {
  async requestCode() {
    await delay();
  },

  async verifyCode(contact, code) {
    await delay();
    if (code !== DEMO_CODE) throw new Error('That code is not right. Please try again.');
    const name = contact.includes('@') ? contact.split('@')[0] : 'Patient';
    return { id: 'p1', name, contact };
  },

  async listServices() {
    await delay(100);
    return services;
  },

  async listAppointments() {
    await delay(150);
    return appointments.map((a) => ({ ...a }));
  },

  async listSlots(serviceId, dayKey, ignoreAppointmentId) {
    await delay(150);
    const service = services.find((s) => s.id === serviceId);
    if (!service) return [];

    const windows = hours[fromDayKey(dayKey).getDay()] ?? [];
    const durationMs = service.minutes * 60000;
    const now = Date.now();

    // Time ranges already taken by this patient's other booked visits.
    const busy = appointments
      .filter((a) => a.status === 'booked' && a.id !== ignoreAppointmentId)
      .map((a) => {
        const start = new Date(a.startsAt).getTime();
        const mins = services.find((s) => s.id === a.serviceId)?.minutes ?? 30;
        return { start, end: start + mins * 60000 };
      });

    const out: string[] = [];
    for (const [open, close] of windows) {
      // A visit must finish before the window closes.
      for (let m = open * 60; m + service.minutes <= close * 60; m += SLOT_STEP_MINUTES) {
        const hour = Math.floor(m / 60);
        const minute = m % 60;
        const start = fromDayKey(dayKey, hour, minute);
        const s = start.getTime();
        if (s <= now) continue;
        if (busy.some((b) => s < b.end && b.start < s + durationMs)) continue;
        if (takenByOthers(dayKey, hour, minute)) continue;
        out.push(start.toISOString());
      }
    }
    return out;
  },

  async book(serviceId, startsAt) {
    await delay();
    const appt: Appointment = { id: `a${nextId++}`, serviceId, startsAt, status: 'booked' };
    appointments.push(appt);
    return { ...appt };
  },

  async reschedule(appointmentId, startsAt) {
    await delay();
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new Error('Appointment not found.');
    if (!canChangeOnline(appt.startsAt)) throw changeBlockedError();
    appt.startsAt = startsAt;
    return { ...appt };
  },

  async cancel(appointmentId) {
    await delay();
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) return;
    if (!canChangeOnline(appt.startsAt)) throw changeBlockedError();
    appt.status = 'cancelled';
  },

  async listExercises() {
    await delay(100);
    return exercises.map((e) => ({ ...e }));
  },

  async setExerciseDone(exerciseId, done) {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (ex) ex.doneToday = done;
  },
};
