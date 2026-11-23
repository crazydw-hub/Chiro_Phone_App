import type { PracticeConfig } from './types';

/**
 * Underwood Chiropractic (Dr. Scott Underwood, O'Fallon IL).
 * Each value is tagged:
 *   [OFFICE]  taken from the office's own forms (Financial Disclosure, Business Arrangement Policy)
 *   [DEMO]    carried over from the website prototype - probably right, verify with the office
 *   [CONFIRM] placeholder. NOT confirmed by the office. Must be confirmed before real patients see it.
 * See docs/OFFICE-DETAILS.md for the full list and the questions to ask Dr. Underwood.
 */
export const underwood: PracticeConfig = {
  id: 'underwood',
  name: 'Underwood Chiropractic', // [OFFICE]
  phoneDisplay: '(618) 624-2400', // [OFFICE] same number on forms and listings
  phoneLink: 'tel:+16186242400',
  // address: intentionally omitted. Sources disagree (787 Sunset Blvd Ste 200 vs 772 Wall St Ste B). [CONFIRM]

  // Navy / white / black from the UC logo (latest direction). Navy hex is from the website prototype;
  // match it to the exact logo color. [CONFIRM]
  brand: {
    primary: '#0A2147',
    primaryDark: '#06142B',
    surface: '#F2F5FA',
    border: '#D9E3F3',
    text: '#14203A',
    muted: '#475672',
  },

  hours: {
    // [DEMO] verify
    0: [],
    1: [[8, 12], [14, 18]],
    2: [[8, 12], [14, 18]],
    3: [[8, 12]],
    4: [[8, 12], [14, 18]],
    5: [[8, 12], [14, 18]],
    6: [],
  },
  slotStepMinutes: 30, // [CONFIRM]

  // PLACEHOLDER. The office's written policies state no cancellation rule, so no fee or penalty is
  // mentioned anywhere in the app. [CONFIRM]
  changeNoticeHours: 24,

  // Names from the website prototype [DEMO]. Visit lengths are placeholders [CONFIRM]
  // (Normatec's 20-30 min is from the prototype's service page). Fees are the only ones in the
  // office's Financial Disclosure form [OFFICE].
  services: [
    { id: 'adjust', name: 'Spinal adjustment', minutes: 20, description: 'Gentle, precise adjustments', feeNote: 'Adult $65 · Child $45' },
    { id: 'art', name: 'Active Release Techniques (ART)', minutes: 30, description: 'Hands-on care for tight muscles, tendons and nerves' },
    { id: 'rehab', name: 'Functional rehabilitation', minutes: 30, description: 'Exercises to build strength and prevent a repeat' },
    { id: 'massage', name: 'Massage therapy', minutes: 30, description: 'Therapeutic massage' },
    { id: 'normatec', name: 'Normatec compression', minutes: 30, description: 'Compression for tired, sore legs' },
    { id: 'reexam', name: 'Re-evaluation', minutes: 30, description: 'Progress check and updated plan', feeNote: 'Adult $85 · Child $75' },
  ],

  // New patients are asked to call. [DEMO/OFFICE] Exam fee from the Financial Disclosure form [OFFICE].
  newPatient: {
    mode: 'call',
    examFee: '$99',
    includes: 'consultation, physical exam, regional exams and a report of findings',
  },
  feesDueNote: 'Fees are due at the time of service.', // [OFFICE]

  // Placeholder exercises until Dr. Underwood supplies real ones.
  exercises: [
    { id: 'e1', title: 'Cat-camel stretch', instructions: 'On hands and knees, slowly arch then round your back.', dosage: '2 x 10 reps' },
    { id: 'e2', title: 'Knee-to-chest', instructions: 'Lying on your back, pull one knee toward your chest and hold.', dosage: '3 x 30 sec each side' },
    { id: 'e3', title: 'Chin tucks', instructions: 'Sit tall and gently draw your chin straight back.', dosage: '2 x 10 reps' },
  ],

  quickReplies: ['Running late', 'Need to reschedule', 'Question about my visit'],

  // All modules on for the demo. Whether each is used for real depends on the office's systems
  // (e.g. their existing patient portal for payments). [CONFIRM]
  features: { carePlan: true, checkIn: true, intakeForms: true, messaging: true, payments: true },
};
