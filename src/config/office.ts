import type { Service } from '../types';

/**
 * Everything specific to Underwood Chiropractic lives in this one file.
 * Each value is tagged:
 *   [OFFICE]  taken from the office's own forms (Financial Disclosure, Business Arrangement Policy)
 *   [DEMO]    carried over from the website prototype - probably right, verify with the office
 *   [CONFIRM] placeholder. NOT confirmed by the office. Must be confirmed before real patients see it.
 * See docs/OFFICE-DETAILS.md for the full list and the questions to ask Dr. Underwood.
 */

export const office = {
  name: 'Underwood Chiropractic', // [OFFICE]
  phoneDisplay: '(618) 624-2400', // [OFFICE] same number on forms and listings
  phoneLink: 'tel:+16186242400',
  // Address intentionally left out: sources disagree (787 Sunset Blvd Ste 200 vs 772 Wall St Ste B). [CONFIRM]
};

/** Opening windows per weekday (0 = Sunday), as [open hour, close hour] in 24h time. [DEMO] verify. */
export const hours: Record<number, [number, number][]> = {
  0: [],
  1: [[8, 12], [14, 18]],
  2: [[8, 12], [14, 18]],
  3: [[8, 12]],
  4: [[8, 12], [14, 18]],
  5: [[8, 12], [14, 18]],
  6: [],
};

/** How far apart bookable start times are, in minutes. [CONFIRM] */
export const SLOT_STEP_MINUTES = 30;

/**
 * Patients can cancel or reschedule in the app only this many hours before the visit; closer than that
 * they are asked to call. This is a PLACEHOLDER. The office's written policies do not state a cancellation
 * rule, so no fee or penalty is mentioned anywhere in the app. [CONFIRM]
 */
export const CHANGE_NOTICE_HOURS = 24;

/**
 * Services patients can book in the app. Names come from the website prototype [DEMO].
 * Visit lengths are placeholders [CONFIRM] (Normatec's 20-30 min comes from the prototype's service page).
 * Fees below are the only ones in the office's Financial Disclosure form [OFFICE].
 */
export const services: Service[] = [
  {
    id: 'adjust',
    name: 'Spinal adjustment',
    minutes: 20,
    description: 'Gentle, precise adjustments',
    feeNote: 'Adult $65 · Child $45',
  },
  { id: 'art', name: 'Active Release Techniques (ART)', minutes: 30, description: 'Hands-on care for tight muscles, tendons and nerves' },
  { id: 'rehab', name: 'Functional rehabilitation', minutes: 30, description: 'Exercises to build strength and prevent a repeat' },
  { id: 'massage', name: 'Massage therapy', minutes: 30, description: 'Therapeutic massage' },
  { id: 'normatec', name: 'Normatec compression', minutes: 30, description: 'Compression for tired, sore legs' },
  {
    id: 'reexam',
    name: 'Re-evaluation',
    minutes: 30,
    description: 'Progress check and updated plan',
    feeNote: 'Adult $85 · Child $75',
  },
];

/** New patients are NOT booked in the app: the office asks new patients to call. [DEMO/OFFICE] */
export const newPatient = {
  examFee: '$99', // [OFFICE] New Patient Exam
  includes: 'consultation, physical exam, regional exams and a report of findings',
};

export const FEES_DUE_NOTE = 'Fees are due at the time of service.'; // [OFFICE]

export function canChangeOnline(startsAtIso: string, now: number = Date.now()): boolean {
  return new Date(startsAtIso).getTime() - now >= CHANGE_NOTICE_HOURS * 60 * 60 * 1000;
}

export function hourLabel(h: number): string {
  return `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? 'pm' : 'am'}`;
}

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Human-readable hours, grouping days that share the same schedule. */
export function describeHours(): string[] {
  const groups: { key: string; days: string[] }[] = [];
  for (const d of DAY_ORDER) {
    const key = hours[d].map(([a, b]) => `${hourLabel(a)} - ${hourLabel(b)}`).join(', ') || 'Closed';
    const existing = groups.find((g) => g.key === key);
    if (existing) existing.days.push(DAY_NAMES[d]);
    else groups.push({ key, days: [DAY_NAMES[d]] });
  }
  return groups.map((g) => `${g.days.join(', ')}: ${g.key}`);
}

export function isOpenDay(dayOfWeek: number): boolean {
  return hours[dayOfWeek].length > 0;
}
