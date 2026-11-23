import type { PracticeConfig } from './types';

/**
 * FICTIONAL sample practice ("Riverside Family Chiropractic") used to show how one codebase serves
 * different offices: different brand, hours (including Saturday), services, new patients booking
 * online, no care plan tab. Not a real business; the phone number is a reserved fictional one.
 */
export const sample: PracticeConfig = {
  id: 'sample',
  name: 'Riverside Family Chiropractic',
  phoneDisplay: '(555) 010-0142',
  phoneLink: 'tel:+15550100142',
  address: '100 Example Street, Anytown',

  brand: {
    primary: '#0F766E',
    primaryDark: '#0B5A54',
    surface: '#F0F8F7',
    border: '#CFE5E2',
  },

  hours: {
    0: [],
    1: [[9, 12], [13, 17]],
    2: [[9, 12], [13, 17]],
    3: [[9, 12], [13, 17]],
    4: [[9, 12], [13, 17]],
    5: [[9, 12], [13, 17]],
    6: [[9, 12]],
  },
  slotStepMinutes: 15,
  changeNoticeHours: 12,

  services: [
    { id: 'new', name: 'New patient exam', minutes: 45, description: 'Consultation, exam and first treatment' },
    { id: 'adjust', name: 'Chiropractic adjustment', minutes: 15, description: 'Regular visit' },
    { id: 'massage', name: 'Massage therapy', minutes: 60, description: 'Full-hour therapeutic massage' },
    { id: 'reexam', name: 'Re-exam', minutes: 30, description: 'Progress check' },
  ],

  newPatient: { mode: 'online' },
  feesDueNote: 'Copays are due at check-in.',

  exercises: [
    { id: 'e1', title: "Child's pose", instructions: 'Kneel and sit back on your heels, reaching your arms forward.', dosage: '3 x 20 sec' },
  ],

  quickReplies: ['Running late', 'Can I come in earlier?'],

  features: { carePlan: false, checkIn: true, intakeForms: true, messaging: true, payments: false },
};
