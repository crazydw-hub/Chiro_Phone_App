import type { PracticeConfig } from './types';

/**
 * STARTING POINT FOR A NEW PRACTICE.
 * 1. Copy this file to src/practice/<practice-name>.ts and rename the export.
 * 2. Replace every TODO with the practice's real details (see docs/TEMPLATE-GUIDE.md for the checklist).
 * 3. Register it in src/practice/active.ts and set ACTIVE_PRACTICE.
 */
export const template: PracticeConfig = {
  id: 'template',
  name: 'TODO Practice Name',
  phoneDisplay: '(000) 000-0000', // TODO
  phoneLink: 'tel:+10000000000', // TODO
  // address: 'TODO', // add once confirmed

  // Only list colors that differ from the defaults. TODO: the practice's logo colors.
  brand: {
    // primary: '#000000',
    // primaryDark: '#000000',
    // surface: '#F5F5F5',
    // border: '#DDDDDD',
  },

  // TODO: real opening hours. 0 = Sunday ... 6 = Saturday. [open hour, close hour] in 24h time.
  hours: {
    0: [],
    1: [[9, 12], [13, 17]],
    2: [[9, 12], [13, 17]],
    3: [[9, 12], [13, 17]],
    4: [[9, 12], [13, 17]],
    5: [[9, 12], [13, 17]],
    6: [],
  },
  slotStepMinutes: 30, // TODO
  changeNoticeHours: null, // TODO: hours of notice to change a visit in the app, or null for no limit

  // TODO: only services the practice wants patients to book by themselves.
  services: [
    { id: 'adjust', name: 'Adjustment', minutes: 20, description: 'Regular visit' },
  ],

  // 'call' = new patients phone the office; 'online' = they book like everyone else
  // (then add a new-patient service above).
  newPatient: { mode: 'call' },
  // feesDueNote: 'TODO, or delete this line',

  // TODO: starter exercises, or leave empty and set features.carePlan to false.
  exercises: [],

  quickReplies: [], // TODO, e.g. ['Running late', 'Need to reschedule']

  // Turn on only what this practice will use.
  features: { carePlan: false, checkIn: false, intakeForms: false, messaging: false, payments: false },
};
