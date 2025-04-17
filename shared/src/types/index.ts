import { z } from 'zod';
import {
  insertUserSchema,
  insertVendorProfileSchema,
  insertTaskSchema,
  insertGuestSchema,
  insertBudgetItemSchema,
  insertVendorBookingSchema,
  insertAchievementSchema,
  users,
  vendorProfiles,
  tasks,
  guests,
  budgetItems,
  vendorBookings,
  achievements,
  userAchievements,
  userProgress,
  timelineEvents,
  messages,
  contactStatus,
  vendorReviews,
  notifications,
  vendorCalendar,
  vendorAnalytics
} from '../schema';

// Type definitions from insert schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVendorProfile = z.infer<typeof insertVendorProfileSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type InsertVendorBooking = z.infer<typeof insertVendorBookingSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

// Type definitions from tables
export type User = typeof users.$inferSelect;
export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type VendorBooking = typeof vendorBookings.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ContactStatus = typeof contactStatus.$inferSelect;
export type VendorReview = typeof vendorReviews.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type VendorCalendar = typeof vendorCalendar.$inferSelect;
export type VendorAnalytics = typeof vendorAnalytics.$inferSelect;

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// For shared socket.io events
export interface NotificationEvent {
  userId: number;
  notification: Notification;
}

export interface MessageEvent {
  message: Message;
  fromUser: {
    id: number;
    name: string;
    role: string;
  };
  toUser: {
    id: number;
    name: string;
    role: string;
  };
}

export interface BookingEvent {
  booking: VendorBooking;
  client: {
    id: number;
    name: string;
  };
  vendor: {
    id: number;
    name: string;
    businessName?: string;
  };
}

export interface SocketEvents {
  'notification:new': (data: NotificationEvent) => void;
  'message:new': (data: MessageEvent) => void;
  'booking:new': (data: BookingEvent) => void;
  'booking:update': (data: BookingEvent) => void;
}