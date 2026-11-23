import type { Exercise, Service } from '../types';

export type Brand = {
  primary: string;
  primaryDark: string;
  onPrimary: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  danger: string;
  success: string;
};

/**
 * Everything that differs from one chiropractic practice to the next.
 * To set the app up for a new practice, copy src/practice/template.ts, fill it in, and point
 * src/practice/active.ts at it. Nothing else in the code needs to change.
 */
export type PracticeConfig = {
  id: string;
  name: string;
  phoneDisplay: string;
  phoneLink: string; // tel: link
  address?: string;

  /** Only the colors that differ from the defaults need to be listed. */
  brand: Partial<Brand>;

  /** Opening windows per weekday (0 = Sunday) as [open hour, close hour], 24h time. */
  hours: Record<number, [number, number][]>;
  /** Minutes between bookable start times. */
  slotStepMinutes: number;
  /** Hours of notice required to cancel or reschedule in the app. null = no restriction. */
  changeNoticeHours: number | null;

  /** Services patients can book in the app. */
  services: Service[];
  /**
   * 'call'   = new patients are asked to phone the office (optionally showing the exam fee).
   * 'online' = new patients book like anyone else (include a new-patient service in `services`).
   */
  newPatient: { mode: 'call' | 'online'; examFee?: string; includes?: string };
  feesDueNote?: string;

  /** Starter home-exercise list for the Care plan tab (placeholder until it comes from the doctor). */
  exercises: Omit<Exercise, 'doneToday'>[];

  /** Quick-reply buttons in Messages (e.g. "Running late"). */
  quickReplies: string[];

  /** Switch modules on or off per practice. */
  features: {
    carePlan: boolean;
    checkIn: boolean; // "I'm here" button
    intakeForms: boolean; // paperwork on the phone
    messaging: boolean; // thread with the office
    payments: boolean; // balance + pay (demo checkout until a real processor is wired in)
  };
};
