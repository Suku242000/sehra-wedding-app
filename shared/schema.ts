import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export const UserRole = {
  BRIDE: "bride",
  GROOM: "groom",
  FAMILY: "family",
  VENDOR: "vendor",
  ADMIN: "admin",
  SUPERVISOR: "supervisor"
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Package types
export const PackageType = {
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum"
} as const;

export type PackageTypeValue = (typeof PackageType)[keyof typeof PackageType];

// Vendor types
export const VendorType = {
  HOTEL: "hotel",
  PHOTOGRAPHER: "photographer",
  VIDEOGRAPHER: "videographer",
  CATERING: "catering",
  MAKEUP: "makeup",
  HAIRDRESSER: "hairdresser",
  DECORATION: "decoration",
  MEHANDI: "mehandi",
  DJ: "dj",
  LIGHTING: "lighting"
} as const;

export type VendorTypeValue = (typeof VendorType)[keyof typeof VendorType];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  package: text("package"),
  weddingDate: text("wedding_date"),
  customerId: text("customer_id"),
  supervisorId: integer("supervisor_id"),
  uniqueId: text("unique_id").unique(), // Unique ID for each user (SC#0001, SV#0001, SP#0001)
  available: boolean("available").default(true), // For supervisors to mark availability
  location: text("location"), // User's location for assignment purposes
  phone: text("phone"), // User's contact number
  assignedVendors: json("assigned_vendors").$type<number[]>(), // Array of vendor user IDs assigned to this client
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor profiles table
export const vendorProfiles = pgTable("vendor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vendorType: text("vendor_type").notNull(),
  businessName: text("business_name").notNull(),
  description: text("description"),
  location: text("location"),
  portfolio: json("portfolio").$type<string[]>(),
  priceRange: text("price_range"),
  availability: json("availability").$type<string[]>(),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date"),
  status: text("status").notNull(), // pending, completed, in-progress
  priority: text("priority"), // high, medium, low
  assignedBy: integer("assigned_by"), // userId of who assigned the task
  createdAt: timestamp("created_at").defaultNow(),
});

// Guests table
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  relationship: text("relationship"),
  status: text("status").notNull(), // confirmed, pending, declined
  side: text("side"), // bride, groom
  plusOnes: integer("plus_ones"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Budget items table
export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  item: text("item").notNull(),
  estimatedCost: integer("estimated_cost").notNull(),
  actualCost: integer("actual_cost"),
  paid: boolean("paid").default(false),
  vendorId: integer("vendor_id"),
  serviceChargePercentage: real("service_charge_percentage"), // Service charge percentage e.g. 2.0, 5.0, 8.0
  serviceChargeAmount: integer("service_charge_amount"), // Calculated or adjusted service charge amount
  serviceChargeEdited: boolean("service_charge_edited").default(false), // Whether a supervisor has adjusted the service charge
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor bookings table
export const vendorBookings = pgTable("vendor_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  eventDate: text("event_date").notNull(),
  status: text("status").notNull(), // pending, confirmed, cancelled
  details: text("details"),
  location: text("location"),
  eventType: text("event_type"), // Type of event (wedding ceremony, reception, etc.)
  budget: integer("budget"), // Budget allocated for this vendor
  approvedBySupervisor: boolean("approved_by_supervisor").default(false),
  supervisorNotes: text("supervisor_notes"),
  vendorNotes: text("vendor_notes"),
  clientNotes: text("client_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // URL or name of the icon
  category: text("category").notNull(), // wedding planning, budget management, etc.
  requiredPoints: integer("required_points").notNull(),
  requiredTasks: json("required_tasks").$type<string[]>(), // List of specific task IDs required
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements table (junction table)
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  displayed: boolean("displayed").default(false), // Has the user seen this achievement notification
  sharedSocial: boolean("shared_social").default(false), // Has the user shared this on social media
});

// User progress table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalPoints: integer("total_points").default(0),
  level: integer("level").default(1),
  tasksCompleted: integer("tasks_completed").default(0),
  checklistProgress: real("checklist_progress").default(0), // Percentage of checklist completed
  budgetHealth: real("budget_health").default(100), // Percentage representing budget status (over/under)
  budgetMood: text("budget_mood").default("neutral"), // happy, neutral, concerned, stressed
  streak: integer("streak").default(0), // consecutive days of app usage
  lastActive: timestamp("last_active").defaultNow(),
});

// Timeline events table
export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: text("event_date").notNull(),
  category: text("category"), // pre-wedding, wedding, post-wedding
  icon: text("icon"),
  color: text("color"),
  completed: boolean("completed").default(false),
  orderIndex: integer("order_index"), // For drag and drop reordering
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table for supervisor-client communication
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Client contact status
export const contactStatus = pgTable("contact_status", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  supervisorId: integer("supervisor_id").notNull(),
  contactComplete: boolean("contact_complete").default(false),
  supervisorStatus: text("supervisor_status").default("pending"), // pending, contacted, in_progress
  lastUpdated: timestamp("last_updated").defaultNow(),
  address: text("address"),
  city: text("city"),
  pincode: text("pincode"),
  state: text("state"),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // system, task, chat, vendor, achievement
  isRead: boolean("is_read").default(false),
  relatedId: integer("related_id"), // ID of related item (task, message, etc.)
  link: text("link"), // Optional link to navigate to
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export const insertVendorProfileSchema = createInsertSchema(vendorProfiles)
  .omit({ id: true, createdAt: true });

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, createdAt: true });

export const insertGuestSchema = createInsertSchema(guests)
  .omit({ id: true, createdAt: true });

export const insertBudgetItemSchema = createInsertSchema(budgetItems)
  .omit({ id: true, createdAt: true });

export const insertVendorBookingSchema = createInsertSchema(vendorBookings)
  .omit({ id: true, createdAt: true });

// Insert schemas for gamification features
export const insertAchievementSchema = createInsertSchema(achievements)
  .omit({ id: true, createdAt: true });

export const insertUserAchievementSchema = createInsertSchema(userAchievements)
  .omit({ id: true, unlockedAt: true });

export const insertUserProgressSchema = createInsertSchema(userProgress)
  .omit({ id: true, lastActive: true });

export const insertTimelineEventSchema = createInsertSchema(timelineEvents)
  .omit({ id: true, createdAt: true });

export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true, createdAt: true });

export const insertContactStatusSchema = createInsertSchema(contactStatus)
  .omit({ id: true, lastUpdated: true });
  
export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, createdAt: true });

// Custom auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([
    UserRole.BRIDE,
    UserRole.GROOM,
    UserRole.FAMILY,
    UserRole.VENDOR,
    UserRole.ADMIN,
    UserRole.SUPERVISOR
  ]),
});

export const packageSelectionSchema = z.object({
  package: z.enum([
    PackageType.SILVER,
    PackageType.GOLD,
    PackageType.PLATINUM
  ]),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVendorProfile = z.infer<typeof insertVendorProfileSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type InsertVendorBooking = z.infer<typeof insertVendorBookingSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertContactStatus = z.infer<typeof insertContactStatusSchema>;

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
export type Notification = typeof notifications.$inferSelect;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PackageSelectionInput = z.infer<typeof packageSelectionSchema>;
