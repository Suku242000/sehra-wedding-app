// Re-export shared schemas
export * from './schema';

// Re-export shared types explicitly to avoid conflicts
export type {
  // Type definitions from shared/types
  ApiResponse,
  AuthState,
  LoginResponse,
  RegisterResponse,
  NotificationEvent,
  MessageEvent,
  BookingEvent,
  SocketEvents
} from './types';

// Re-export shared components
export * from './components';

// Re-export shared hooks
export * from './hooks';

// Re-export shared utilities
export * from './utils';