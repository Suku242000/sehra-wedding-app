import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
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

export type User = typeof users.$inferSelect;
export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type VendorBooking = typeof vendorBookings.$inferSelect;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PackageSelectionInput = z.infer<typeof packageSelectionSchema>;
