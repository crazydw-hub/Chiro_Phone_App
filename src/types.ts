export type Patient = {
  id: string;
  name: string;
  contact: string; // email or phone used to sign in
};

export type Service = {
  id: string;
  name: string;
  minutes: number;
  description: string;
  feeNote?: string; // only when the office has published a fee for this service
};

export type Appointment = {
  id: string;
  serviceId: string;
  startsAt: string; // ISO timestamp
  status: 'booked' | 'cancelled';
  checkedInAt?: string; // set when the patient taps "I'm here"
};

export type Exercise = {
  id: string;
  title: string;
  instructions: string;
  dosage: string; // e.g. "3 x 10 reps"
  doneToday: boolean;
};

export type Message = {
  id: string;
  from: 'patient' | 'office';
  text: string;
  sentAt: string;
  auto?: boolean; // automatic reply, not a person
};

export type Charge = {
  id: string;
  date: string; // ISO
  description: string;
  cents: number;
  paid: boolean;
};

export type Receipt = {
  id: string;
  paidAt: string;
  cents: number;
  last4: string;
};

export type IntakeForm = {
  status: 'not_started' | 'in_progress' | 'submitted';
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  reason: string;
  areas: string[];
  priorChiro: 'yes' | 'no' | '';
  notes: string;
  consent: boolean;
  signature: string;
  submittedAt?: string;
};

/** What the front desk would see (demo preview only). */
export type FrontDeskView = {
  arrivals: { appointmentId: string; serviceName: string; checkedInAt: string }[];
  patientMessages: Message[];
  unreadCount: number;
  intake: IntakeForm;
  payments: Receipt[];
};

export type Tab = 'appointments' | 'book' | 'messages' | 'care' | 'settings';

/** Full-screen pages opened from the tabs. */
export type Overlay = 'intake' | 'pay' | 'frontdesk';
