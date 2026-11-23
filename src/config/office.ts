import { practice } from '../practice/active';

/**
 * Convenience layer over the active practice (src/practice/active.ts).
 * Office facts are NOT edited here - edit the practice's own file, e.g. src/practice/underwood.ts.
 */

export const office = {
  name: practice.name,
  phoneDisplay: practice.phoneDisplay,
  phoneLink: practice.phoneLink,
  address: practice.address,
};

export const hours = practice.hours;
export const SLOT_STEP_MINUTES = practice.slotStepMinutes;
export const CHANGE_NOTICE_HOURS = practice.changeNoticeHours;
export const services = practice.services;
export const newPatient = practice.newPatient;
export const FEES_DUE_NOTE = practice.feesDueNote ?? '';

/** True if a visit can still be cancelled or rescheduled in the app. */
export function canChangeOnline(startsAtIso: string, now: number = Date.now()): boolean {
  if (CHANGE_NOTICE_HOURS === null) return true;
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

/** "I'm here" opens this many minutes before the visit and closes 30 minutes after it starts. */
export const CHECK_IN_OPENS_MINUTES = 60;
export const CHECK_IN_CLOSES_AFTER_MINUTES = 30;

export function canCheckIn(startsAtIso: string, now: number = Date.now()): boolean {
  const minutesUntil = (new Date(startsAtIso).getTime() - now) / 60000;
  return minutesUntil <= CHECK_IN_OPENS_MINUTES && minutesUntil >= -CHECK_IN_CLOSES_AFTER_MINUTES;
}
