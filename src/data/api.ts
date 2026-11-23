import type { Appointment, Exercise, Patient, Service } from '../types';
import { fromDayKey } from '../utils/dates';

/**
 * Everything the app needs from a backend goes through this interface.
 * Today it is backed by in-memory mock data (see mockApi.ts). Later we write a second
 * implementation (Supabase or similar) and swap it in one place - screens do not change.
 */
export interface ClinicApi {
  requestCode(contact: string): Promise<void>;
  verifyCode(contact: string, code: string): Promise<Patient>;

  listServices(): Promise<Service[]>;
  listAppointments(): Promise<Appointment[]>;
  /** Open start times (ISO) for a service on a local day (YYYY-MM-DD). */
  listSlots(serviceId: string, dayKey: string): Promise<string[]>;
  book(serviceId: string, startsAt: string): Promise<Appointment>;
  reschedule(appointmentId: string, startsAt: string): Promise<Appointment>;
  cancel(appointmentId: string): Promise<void>;

  listExercises(): Promise<Exercise[]>;
  setExerciseDone(exerciseId: string, done: boolean): Promise<void>;
}

export const DEMO_CODE = '123456';

// ---------------------------------------------------------------------------------------------
// Mock implementation. Placeholder services/exercises - replace with the office's real ones.
// ---------------------------------------------------------------------------------------------

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const services: Service[] = [
  { id: 'adjust', name: 'Spinal adjustment', minutes: 20, description: 'Regular visit' },
  { id: 'new', name: 'New patient visit', minutes: 45, description: 'Exam, history and first treatment' },
  { id: 'reexam', name: 'Re-exam', minutes: 30, description: 'Progress check and updated plan' },
];

const exercises: Exercise[] = [
  { id: 'e1', title: 'Cat-camel stretch', instructions: 'On hands and knees, slowly arch then round your back.', dosage: '2 x 10 reps', doneToday: false },
  { id: 'e2', title: 'Knee-to-chest', instructions: 'Lying on your back, pull one knee toward your chest and hold.', dosage: '3 x 30 sec each side', doneToday: false },
  { id: 'e3', title: 'Chin tucks', instructions: 'Sit tall and gently draw your chin straight back.', dosage: '2 x 10 reps', doneToday: false },
];

const appointments: Appointment[] = [];
let nextId = 1;

function seedAppointment() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
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

  async listSlots(_serviceId, dayKey) {
    await delay(150);
    const now = Date.now();
    const booked = new Set(appointments.filter((a) => a.status === 'booked').map((a) => a.startsAt));
    const out: string[] = [];
    for (let hour = 9; hour < 17; hour++) {
      if (hour === 12) continue; // lunch
      for (const minute of [0, 30]) {
        const start = fromDayKey(dayKey, hour, minute);
        const iso = start.toISOString();
        if (start.getTime() <= now) continue;
        if (booked.has(iso)) continue;
        if (takenByOthers(dayKey, hour, minute)) continue;
        out.push(iso);
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
    appt.startsAt = startsAt;
    return { ...appt };
  },

  async cancel(appointmentId) {
    await delay();
    const appt = appointments.find((a) => a.id === appointmentId);
    if (appt) appt.status = 'cancelled';
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
