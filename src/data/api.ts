import {
  CHANGE_NOTICE_HOURS,
  CHECK_IN_OPENS_MINUTES,
  SLOT_STEP_MINUTES,
  canChangeOnline,
  canCheckIn,
  hours,
  office,
  services,
} from '../config/office';
import { practice } from '../practice/active';
import type {
  Appointment,
  Charge,
  Exercise,
  FrontDeskView,
  IntakeForm,
  Message,
  Patient,
  Receipt,
  Service,
} from '../types';
import { fromDayKey } from '../utils/dates';

/**
 * Everything the app needs from a backend goes through this interface.
 * Today it is backed by in-memory mock data. Later we write a second implementation
 * (Supabase or similar) and swap it in one place - screens do not change.
 * Practice-specific facts (services, hours, fees, change window) come from src/practice/.
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
  /** "I'm here": tells the front desk the patient has arrived. */
  checkIn(appointmentId: string): Promise<Appointment>;

  listExercises(): Promise<Exercise[]>;
  setExerciseDone(exerciseId: string, done: boolean): Promise<void>;

  listMessages(): Promise<Message[]>;
  sendMessage(text: string): Promise<Message>;

  getIntake(): Promise<IntakeForm>;
  saveIntake(form: IntakeForm): Promise<IntakeForm>;
  submitIntake(form: IntakeForm): Promise<IntakeForm>;

  getBalance(): Promise<{ charges: Charge[]; dueCents: number }>;
  /** Demo checkout only. A real processor's hosted page replaces this later. */
  payBalance(): Promise<Receipt>;

  /** Only the mock backend has these. They stage situations for demos. */
  demo?: DemoTools;
}

export interface DemoTools {
  addVisitSoon(): Promise<void>;
  addCharge(): Promise<void>;
  officeReply(): Promise<void>;
  frontDesk(): Promise<FrontDeskView>;
}

export const DEMO_CODE = '123456';

export function emptyIntake(): IntakeForm {
  return {
    status: 'not_started',
    fullName: '',
    dob: '',
    phone: '',
    email: '',
    reason: '',
    areas: [],
    priorChiro: '',
    notes: '',
    consent: false,
    signature: '',
  };
}

// ---------------------------------------------------------------------------------------------
// Mock implementation. Exercises come from the practice's placeholder list.
// ---------------------------------------------------------------------------------------------

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const exercises: Exercise[] = practice.exercises.map((e) => ({ ...e, doneToday: false }));
const appointments: Appointment[] = [];
let nextId = 1;

const messages: Message[] = [
  {
    id: 'm1',
    from: 'office',
    text: `Welcome to ${office.name}! Message us here for non-urgent questions. For anything urgent, call ${office.phoneDisplay}.`,
    sentAt: new Date().toISOString(),
    auto: true,
  },
];
let nextMessageId = 2;
let autoReplied = false;

const charges: Charge[] = [];
const receipts: Receipt[] = [];
let nextChargeId = 1;

let intake: IntakeForm = emptyIntake();

// One sample upcoming visit, on the first open day at least 3 days away, at 10:00.
function seedAppointment() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  while (hours[d.getDay()].length === 0) d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  appointments.push({ id: `a${nextId++}`, serviceId: services[0].id, startsAt: d.toISOString(), status: 'booked' });
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

function pushMessage(from: Message['from'], text: string, auto = false): Message {
  const m: Message = { id: `m${nextMessageId++}`, from, text, sentAt: new Date().toISOString(), auto };
  messages.push(m);
  return m;
}

const demoTools: DemoTools = {
  async addVisitSoon() {
    const d = new Date(Date.now() + 20 * 60000);
    appointments.push({ id: `a${nextId++}`, serviceId: services[0].id, startsAt: d.toISOString(), status: 'booked' });
  },

  async addCharge() {
    charges.push({
      id: `c${nextChargeId++}`,
      date: new Date().toISOString(),
      description: 'Demo charge - visit balance',
      cents: 2500,
      paid: false,
    });
  },

  async officeReply() {
    pushMessage('office', 'Thanks for letting us know - see you soon!');
  },

  async frontDesk() {
    const lastHumanReply = messages.reduce((idx, m, i) => (m.from === 'office' && !m.auto ? i : idx), -1);
    const patientMessages = messages.filter((m) => m.from === 'patient');
    const unreadCount = messages.filter((m, i) => m.from === 'patient' && i > lastHumanReply).length;
    return {
      arrivals: appointments
        .filter((a) => a.checkedInAt)
        .map((a) => ({
          appointmentId: a.id,
          serviceName: services.find((s) => s.id === a.serviceId)?.name ?? 'Visit',
          checkedInAt: a.checkedInAt as string,
        })),
      patientMessages: patientMessages.slice(-5),
      unreadCount,
      intake: { ...intake },
      payments: receipts.map((r) => ({ ...r })),
    };
  },
};

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

  async checkIn(appointmentId) {
    await delay();
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt || appt.status !== 'booked') throw new Error('Appointment not found.');
    if (!canCheckIn(appt.startsAt)) {
      throw new Error(`Check-in opens ${CHECK_IN_OPENS_MINUTES} minutes before your visit.`);
    }
    if (!appt.checkedInAt) appt.checkedInAt = new Date().toISOString();
    return { ...appt };
  },

  async listExercises() {
    await delay(100);
    return exercises.map((e) => ({ ...e }));
  },

  async setExerciseDone(exerciseId, done) {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (ex) ex.doneToday = done;
  },

  async listMessages() {
    return messages.map((m) => ({ ...m }));
  },

  async sendMessage(text) {
    await delay(100);
    const clean = text.trim();
    if (!clean) throw new Error('Type a message first.');
    const m = pushMessage('patient', clean);
    if (!autoReplied) {
      autoReplied = true;
      // An automatic acknowledgement, clearly labelled as automatic (not a person).
      setTimeout(() => {
        pushMessage(
          'office',
          `Automatic reply: thanks, we got your message and will reply during office hours. In an emergency call 911; for anything urgent call ${office.phoneDisplay}.`,
          true,
        );
      }, 1500);
    }
    return { ...m };
  },

  async getIntake() {
    await delay(100);
    return { ...intake, areas: [...intake.areas] };
  },

  async saveIntake(form) {
    await delay(100);
    intake = { ...form, areas: [...form.areas], status: intake.status === 'submitted' ? 'submitted' : 'in_progress' };
    return { ...intake };
  },

  async submitIntake(form) {
    await delay();
    if (!form.fullName.trim() || !form.reason.trim()) throw new Error('Please fill in your name and the reason for your visit.');
    if (!form.consent || !form.signature.trim()) throw new Error('Please accept the acknowledgement and type your name to sign.');
    intake = { ...form, areas: [...form.areas], status: 'submitted', submittedAt: new Date().toISOString() };
    return { ...intake };
  },

  async getBalance() {
    await delay(100);
    const dueCents = charges.filter((c) => !c.paid).reduce((sum, c) => sum + c.cents, 0);
    return { charges: charges.map((c) => ({ ...c })), dueCents };
  },

  async payBalance() {
    await delay(600);
    const unpaid = charges.filter((c) => !c.paid);
    if (unpaid.length === 0) throw new Error('There is nothing to pay.');
    const cents = unpaid.reduce((sum, c) => sum + c.cents, 0);
    unpaid.forEach((c) => {
      c.paid = true;
    });
    const receipt: Receipt = { id: `r${receipts.length + 1}`, paidAt: new Date().toISOString(), cents, last4: '4242' };
    receipts.push(receipt);
    return { ...receipt };
  },

  demo: demoTools,
};
