import { sample } from './sample';
import { template } from './template';
import type { PracticeConfig } from './types';
import { underwood } from './underwood';

const all = { underwood, sample, template };

/**
 * THE ONE SWITCH. Change this to rebrand the whole app for a different practice:
 *   'underwood' - Underwood Chiropractic (the real client)
 *   'sample'    - fictional demo practice (different brand, hours, services)
 *   'template'  - blank starting point
 */
export const ACTIVE_PRACTICE: keyof typeof all = 'underwood';

export const practice: PracticeConfig = all[ACTIVE_PRACTICE];
