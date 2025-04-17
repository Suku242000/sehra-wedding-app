import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  integer,
  boolean,
  real,
  jsonb,
  uniqueIndex,
  primaryKey,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define role enum
export enum UserRole {
  BRIDE = "bride",
  GROOM = "groom",
  FAMILY = "family",
  VENDOR = "vendor",
  SUPERVISOR = "supervisor",
  ADMIN = "admin"
}

// Export the union type of role values
export type UserRoleType = `${UserRole}`;

// Define package type enum
export enum PackageType {
  SILVER = "Silver",
  GOLD = "Gold",
  PLATINUM = "Platinum"
}

// Export the union type of package values
export type PackageTypeValue = `${PackageType}`;

// Define vendor type enum
export enum VendorType {
  HOTEL = "hotel",
  PHOTOGRAPHER = "photographer",
  VIDEOGRAPHER = "videographer",
  CATERING = "catering",
  MAKEUP = "makeup",
  HAIRDRESSER = "hairdresser",
  DECORATION = "decoration",
  MEHANDI = "mehandi",
  DJ = "dj",
  LIGHTING = "lighting"
}

// Export the union type of vendor values
export type VendorTypeValue = `${VendorType}`;

// Login and register schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  role: z.nativeEnum(UserRole)
});

export const packageSelectionSchema = z.object({
  package: z.nativeEnum(PackageType),
  budget: z.number().positive(),
  weddingDate: z.string(),
  location: z.string(),
  partnerName: z.string()
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Client-specific fields
  weddingDate: date("wedding_date"),
  package: text("package"),
  budget: real("budget"),
  location: text("location"),
  partnerName: text("partner_name"),
  progress: integer("progress").default(0),
  
  // Internal-specific fields
  vendorType: text("vendor_type"),
  specialization: text("specialization"),
  ratings: real("ratings").default(0),
  adminLevel: text("admin_level"),
  lastActive: timestamp("last_active"),
  
  // Supervisor-specific fields
  maxClients: integer("max_clients").default(10),
  
  // Stripe integration
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
}, (table) => {
  return {
    emailIdx: uniqueIndex("email_idx").on(table.email),
  };
});

// User relations (we'll fix the relationships after the schema is fully defined)
// We'll fix these once all tables have been defined to avoid forward references
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  guests: many(guests),
  budgetItems: many(budgetItems),
  userAchievements: many(userAchievements),
  timelineEvents: many(timelineEvents),
  notifications: many(notifications),
}));

// Supervisor-Client mapping table
export const supervisorClients = pgTable("supervisor_clients", {
  id: serial("id").primaryKey(),
  supervisorId: integer("supervisor_id").notNull().references(() => users.id),
  clientId: integer("client_id").notNull().references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  active: boolean("active").default(true),
}, (table) => {
  return {
    uniqMapping: uniqueIndex("supervisor_client_idx").on(table.supervisorId, table.clientId),
  };
});

// Supervisor-Client relations
export const supervisorClientsRelations = relations(supervisorClients, ({ one }) => ({
  supervisor: one(users, { 
    fields: [supervisorClients.supervisorId], 
    references: [users.id],
    relationName: "supervisor_assignments" 
  }),
  client: one(users, { 
    fields: [supervisorClients.clientId], 
    references: [users.id],
    relationName: "client_supervisor" 
  }),
}));

// Vendor profiles table
export const vendorProfiles = pgTable("vendor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  businessName: text("business_name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // Photography, Catering, Venue, etc.
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  website: text("website"),
  socialMedia: jsonb("social_media"),
  services: jsonb("services"),
  pricing: jsonb("pricing"),
  images: jsonb("images"),
  sqsScore: real("sqs_score").default(0), // Service Quality Score
  category: text("category").default("standard"), // standard, gold, premium
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor profile relations
export const vendorProfilesRelations = relations(vendorProfiles, ({ one }) => ({
  user: one(users, { 
    fields: [vendorProfiles.userId], 
    references: [users.id],
    relationName: "vendor_profile" 
  }),
}));

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  completed: boolean("completed").default(false),
  status: text("status").default("pending"),  // pending, in_progress, completed
  category: text("category").default("general"),
  priority: text("priority").default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks relations
export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, { 
    fields: [tasks.userId], 
    references: [users.id],
    relationName: "user_tasks" 
  }),
}));

// This is handled in the export types section at the bottom of the file

// Guests table
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  rsvpStatus: text("rsvp_status").default("pending"),
  plusOne: boolean("plus_one").default(false),
  plusOneName: text("plus_one_name"),
  group: text("group"),
  dietaryRestrictions: text("dietary_restrictions"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guests relations
export const guestsRelations = relations(guests, ({ one }) => ({
  user: one(users, { 
    fields: [guests.userId], 
    references: [users.id],
    relationName: "user_guests" 
  }),
}));

// Budget items table
export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  estimatedCost: real("estimated_cost").notNull(),
  actualCost: real("actual_cost"),
  paidAmount: real("paid_amount").default(0),
  vendorId: integer("vendor_id").references(() => vendorProfiles.id),
  dueDate: date("due_date"),
  isPaid: boolean("is_paid").default(false),
  advanceAmount: real("advance_amount").default(0),
  advancePaid: boolean("advance_paid").default(false),
  advanceDueDate: date("advance_due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Budget items relations
export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  user: one(users, { 
    fields: [budgetItems.userId], 
    references: [users.id],
    relationName: "user_budget_items" 
  }),
  vendor: one(vendorProfiles, { 
    fields: [budgetItems.vendorId], 
    references: [vendorProfiles.id],
    relationName: "vendor_budget_items" 
  }),
}));

// Vendor bookings table
export const vendorBookings = pgTable("vendor_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  vendorId: integer("vendor_id").notNull().references(() => vendorProfiles.id),
  eventDate: date("event_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  status: text("status").default("pending"), // pending, confirmed, canceled
  package: text("package"),
  amount: real("amount"),
  advanceAmount: real("advance_amount").default(0),
  advancePaid: boolean("advance_paid").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor bookings relations
export const vendorBookingsRelations = relations(vendorBookings, ({ one }) => ({
  user: one(users, { 
    fields: [vendorBookings.userId], 
    references: [users.id],
    relationName: "user_vendor_bookings" 
  }),
  vendor: one(vendorProfiles, { 
    fields: [vendorBookings.vendorId], 
    references: [vendorProfiles.id],
    relationName: "vendor_bookings" 
  }),
}));

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  points: integer("points").default(10),
  icon: text("icon"),
  criteria: jsonb("criteria"), // Stored as JSON to allow flexible criteria
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievements relations
export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements, { relationName: "achievement_unlocks" }),
}));

// User achievements table (junction table)
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").default(0), // For achievements that require multiple steps
}, (table) => {
  return {
    uniqUserAchievement: uniqueIndex("user_achievement_idx").on(table.userId, table.achievementId),
  };
});

// User achievements relations
export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { 
    fields: [userAchievements.userId], 
    references: [users.id],
    relationName: "user_achievements" 
  }),
  achievement: one(achievements, { 
    fields: [userAchievements.achievementId], 
    references: [achievements.id],
    relationName: "achievement_unlocks" 
  }),
}));

// User progress table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  overallProgress: integer("overall_progress").default(0),
  planningProgress: integer("planning_progress").default(0),
  guestProgress: integer("guest_progress").default(0),
  budgetProgress: integer("budget_progress").default(0),
  vendorProgress: integer("vendor_progress").default(0),
  budgetMood: text("budget_mood").default("neutral"), // nervous, neutral, happy
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// User progress relations
export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { 
    fields: [userProgress.userId], 
    references: [users.id],
    relationName: "user_progress_record" 
  }),
}));

// Timeline events table
export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  time: text("time"),
  location: text("location"),
  category: text("category").default("general"),
  completed: boolean("completed").default(false),
  notifyDaysBefore: integer("notify_days_before").default(7),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timeline events relations
export const timelineEventsRelations = relations(timelineEvents, ({ one }) => ({
  user: one(users, { 
    fields: [timelineEvents.userId], 
    references: [users.id],
    relationName: "user_timeline_events" 
  }),
}));

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Messages relations
export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { 
    fields: [messages.fromUserId], 
    references: [users.id],
    relationName: "sent_messages" 
  }),
  recipient: one(users, { 
    fields: [messages.toUserId], 
    references: [users.id],
    relationName: "received_messages" 
  }),
}));

// Contact statuses table (for supervisor contact tracking)
export const contactStatuses = pgTable("contact_statuses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  supervisorId: integer("supervisor_id").references(() => users.id),
  lastContactDate: timestamp("last_contact_date"),
  nextContactDate: timestamp("next_contact_date"),
  contactFrequency: integer("contact_frequency").default(7), // in days
  notes: text("notes"),
  priority: text("priority").default("medium"), // high, medium, low
  status: text("status").default("pending"), // pending, active, completed
});

// Contact statuses relations
export const contactStatusesRelations = relations(contactStatuses, ({ one }) => ({
  user: one(users, { 
    fields: [contactStatuses.userId], 
    references: [users.id],
    relationName: "user_contact_status" 
  }),
  supervisor: one(users, { 
    fields: [contactStatuses.supervisorId], 
    references: [users.id],
    relationName: "supervisor_contacts" 
  }),
}));

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").default("general"), // general, task, event, message, etc.
  read: boolean("read").default(false),
  actionLink: text("action_link"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { 
    fields: [notifications.userId], 
    references: [users.id],
    relationName: "user_notifications" 
  }),
}));

// Vendor reviews table
export const vendorReviews = pgTable("vendor_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  vendorId: integer("vendor_id").notNull().references(() => vendorProfiles.id),
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content"),
  responsiveness: integer("responsiveness"),
  professionalism: integer("professionalism"),
  quality: integer("quality"),
  valueForMoney: integer("value_for_money"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor reviews relations
export const vendorReviewsRelations = relations(vendorReviews, ({ one }) => ({
  user: one(users, { 
    fields: [vendorReviews.userId], 
    references: [users.id],
    relationName: "user_reviews_given" 
  }),
  vendor: one(vendorProfiles, { 
    fields: [vendorReviews.vendorId], 
    references: [vendorProfiles.id],
    relationName: "vendor_reviews" 
  }),
}));

// Vendor calendar table
export const vendorCalendar = pgTable("vendor_calendar", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendorProfiles.id),
  title: text("title").notNull(),
  date: date("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  isAllDay: boolean("is_all_day").default(false),
  isAvailable: boolean("is_available").default(true),
  bookingId: integer("booking_id").references(() => vendorBookings.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor calendar relations
export const vendorCalendarRelations = relations(vendorCalendar, ({ one }) => ({
  vendor: one(vendorProfiles, { 
    fields: [vendorCalendar.vendorId], 
    references: [vendorProfiles.id],
    relationName: "vendor_calendar" 
  }),
  booking: one(vendorBookings, { 
    fields: [vendorCalendar.bookingId], 
    references: [vendorBookings.id],
    relationName: "booking_calendar_entry" 
  }),
}));

// Vendor analytics table
export const vendorAnalytics = pgTable("vendor_analytics", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendorProfiles.id).unique(),
  totalBookings: integer("total_bookings").default(0),
  completedBookings: integer("completed_bookings").default(0),
  canceledBookings: integer("canceled_bookings").default(0),
  totalRevenue: real("total_revenue").default(0),
  averageRating: real("average_rating").default(0),
  responsivenessScore: real("responsiveness_score").default(0),
  professionalismScore: real("professionalism_score").default(0),
  qualityScore: real("quality_score").default(0),
  valueScore: real("value_score").default(0),
  clickThroughRate: real("click_through_rate").default(0),
  conversionRate: real("conversion_rate").default(0),
  responseTime: integer("response_time").default(0), // in minutes
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Vendor analytics relations
export const vendorAnalyticsRelations = relations(vendorAnalytics, ({ one }) => ({
  vendor: one(vendorProfiles, { 
    fields: [vendorAnalytics.vendorId], 
    references: [vendorProfiles.id],
    relationName: "vendor_performance_analytics" 
  }),
}));

// Define insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorProfileSchema = createInsertSchema(vendorProfiles).omit({ id: true, createdAt: true, updatedAt: true, sqsScore: true, category: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGuestSchema = createInsertSchema(guests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorBookingSchema = createInsertSchema(vendorBookings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, sentAt: true, readAt: true });
export const insertContactStatusSchema = createInsertSchema(contactStatuses).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertVendorReviewSchema = createInsertSchema(vendorReviews).omit({ id: true, createdAt: true, updatedAt: true, verified: true });
export const insertVendorCalendarSchema = createInsertSchema(vendorCalendar).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorAnalyticsSchema = createInsertSchema(vendorAnalytics).omit({ id: true, lastUpdated: true });
export const insertSupervisorClientSchema = createInsertSchema(supervisorClients).omit({ id: true, assignedAt: true });

// Define insert types
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
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertVendorReview = z.infer<typeof insertVendorReviewSchema>;
export type InsertVendorCalendar = z.infer<typeof insertVendorCalendarSchema>;
export type InsertVendorAnalytics = z.infer<typeof insertVendorAnalyticsSchema>;
export type InsertSupervisorClient = z.infer<typeof insertSupervisorClientSchema>;

// Define select types
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
export type ContactStatus = typeof contactStatuses.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type VendorReview = typeof vendorReviews.$inferSelect;
export type VendorCalendar = typeof vendorCalendar.$inferSelect;
export type VendorAnalytics = typeof vendorAnalytics.$inferSelect;
export type SupervisorClient = typeof supervisorClients.$inferSelect;