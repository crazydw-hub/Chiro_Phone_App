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
};

export type Appointment = {
  id: string;
  serviceId: string;
  startsAt: string; // ISO timestamp
  status: 'booked' | 'cancelled';
};

export type Exercise = {
  id: string;
  title: string;
  instructions: string;
  dosage: string; // e.g. "3 x 10 reps"
  doneToday: boolean;
};

export type Tab = 'appointments' | 'book' | 'care' | 'settings';
