// Main export file for shared code between applications

// Export all shared components
export * from './components/index';

// Export all shared hooks
export * from './hooks/index';

// Export all shared utilities
export * from './utils/index';

// Export any types from schema
export * from '../schema';

// Export commonly used constants
export const ROLES = {
  CLIENT: {
    BRIDE: 'bride',
    GROOM: 'groom',
    FAMILY: 'family'
  },
  INTERNAL: {
    VENDOR: 'vendor',
    SUPERVISOR: 'supervisor',
    ADMIN: 'admin'
  }
};

export const PACKAGE_TYPES = {
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum'
};

export const PACKAGE_RANGES = {
  SILVER: { min: 1000000, max: 3000000, serviceCharge: 0.02 },
  GOLD: { min: 3100000, max: 6000000, serviceCharge: 0.05 },
  PLATINUM: { min: 6100000, max: Infinity, serviceCharge: 0.08 }
};

export const VENDOR_CATEGORIES = [
  { id: 'venue', name: 'Venue', icon: 'building' },
  { id: 'catering', name: 'Catering', icon: 'utensils' },
  { id: 'decor', name: 'Decor', icon: 'flower' },
  { id: 'photography', name: 'Photography', icon: 'camera' },
  { id: 'music', name: 'Music', icon: 'music' },
  { id: 'transport', name: 'Transport', icon: 'car' },
  { id: 'mehendi', name: 'Mehendi', icon: 'palette' },
  { id: 'makeup', name: 'Makeup', icon: 'scissors' },
  { id: 'jewelry', name: 'Jewelry', icon: 'gem' },
  { id: 'entertainment', name: 'Entertainment', icon: 'microphone' },
  { id: 'priest', name: 'Priest', icon: 'book' },
  { id: 'invitation', name: 'Invitation', icon: 'mail' }
];

export const VENDOR_TIERS = {
  REGULAR: 'regular',
  GOLD: 'gold',
  PREMIUM: 'premium'
};

export const SQS_THRESHOLDS = {
  GOLD: 70,
  PREMIUM: 85
};

// Export constants for achievement system
export const ACHIEVEMENT_CATEGORIES = {
  BUDGET: 'budget',
  PLANNING: 'planning',
  VENDOR: 'vendor',
  GUEST: 'guest',
  TIMELINE: 'timeline'
};