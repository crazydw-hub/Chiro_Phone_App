import { practice } from './practice/active';
import type { Brand } from './practice/types';

// Neutral defaults. Each practice overrides only the colors that differ (see its `brand` field).
const defaults: Brand = {
  primary: '#5B2A86',
  primaryDark: '#431C66',
  onPrimary: '#FFFFFF',
  bg: '#FFFFFF',
  surface: '#F6F2FA',
  text: '#1F1530',
  muted: '#6B6178',
  border: '#E4DCEE',
  danger: '#B3261E',
  success: '#2E7D32',
};

export const colors: Brand = { ...defaults, ...practice.brand };

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 8, md: 14, lg: 20 };
