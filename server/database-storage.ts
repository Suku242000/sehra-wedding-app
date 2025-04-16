import { 
  User, 
  InsertUser, 
  VendorProfile, 
  InsertVendorProfile,
  Task,
  InsertTask,
  Guest,
  InsertGuest,
  BudgetItem,
  InsertBudgetItem,
  VendorBooking,
  InsertVendorBooking,
  Achievement,
  InsertAchievement,
  UserAchievement,
  InsertUserAchievement,
  UserProgress,
  InsertUserProgress,
  TimelineEvent,
  InsertTimelineEvent,
  users,
  vendorProfiles,
  tasks,
  guests,
  budgetItems,
  vendorBookings,
  achievements,
  userAchievements,
  userProgress,
  timelineEvents
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { IStorage } from "./storage";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  async getUserCountByRoles(roles: string[]): Promise<number> {
    const usersWithRoles = await db.select()
      .from(users)
      .where(roles.length > 0 ? 
        roles.map(role => eq(users.role, role)).reduce((a, b) => a || b) : 
        eq(users.role, roles[0]));
    return usersWithRoles.length;
  }

  async getUsersBySupervisorId(supervisorId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.supervisorId, supervisorId));
  }

  // Vendor methods
  async getVendorProfile(id: number): Promise<VendorProfile | undefined> {
    const [profile] = await db.select().from(vendorProfiles).where(eq(vendorProfiles.id, id));
    return profile;
  }

  async getVendorProfileByUserId(userId: number): Promise<VendorProfile | undefined> {
    const [profile] = await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, userId));
    return profile;
  }

  async createVendorProfile(profile: InsertVendorProfile): Promise<VendorProfile> {
    const [newProfile] = await db.insert(vendorProfiles).values(profile).returning();
    return newProfile;
  }

  async updateVendorProfile(id: number, profileData: Partial<VendorProfile>): Promise<VendorProfile | undefined> {
    const [updatedProfile] = await db
      .update(vendorProfiles)
      .set(profileData)
      .where(eq(vendorProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  async getAllVendorProfiles(): Promise<VendorProfile[]> {
    return await db.select().from(vendorProfiles);
  }

  async getVendorProfilesByType(type: string): Promise<VendorProfile[]> {
    return await db.select().from(vendorProfiles).where(eq(vendorProfiles.vendorType, type));
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return !!result;
  }

  // Guest methods
  async getGuest(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest;
  }

  async getGuestsByUserId(userId: number): Promise<Guest[]> {
    return await db.select().from(guests).where(eq(guests.userId, userId));
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const [newGuest] = await db.insert(guests).values(guest).returning();
    return newGuest;
  }

  async updateGuest(id: number, guestData: Partial<Guest>): Promise<Guest | undefined> {
    const [updatedGuest] = await db
      .update(guests)
      .set(guestData)
      .where(eq(guests.id, id))
      .returning();
    return updatedGuest;
  }

  async deleteGuest(id: number): Promise<boolean> {
    const result = await db.delete(guests).where(eq(guests.id, id));
    return !!result;
  }

  // Budget methods
  async getBudgetItem(id: number): Promise<BudgetItem | undefined> {
    const [item] = await db.select().from(budgetItems).where(eq(budgetItems.id, id));
    return item;
  }

  async getBudgetItemsByUserId(userId: number): Promise<BudgetItem[]> {
    return await db.select().from(budgetItems).where(eq(budgetItems.userId, userId));
  }

  async createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem> {
    const [newItem] = await db.insert(budgetItems).values(item).returning();
    return newItem;
  }

  async updateBudgetItem(id: number, itemData: Partial<BudgetItem>): Promise<BudgetItem | undefined> {
    const [updatedItem] = await db
      .update(budgetItems)
      .set(itemData)
      .where(eq(budgetItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteBudgetItem(id: number): Promise<boolean> {
    const result = await db.delete(budgetItems).where(eq(budgetItems.id, id));
    return !!result;
  }

  // Vendor booking methods
  async getVendorBooking(id: number): Promise<VendorBooking | undefined> {
    const [booking] = await db.select().from(vendorBookings).where(eq(vendorBookings.id, id));
    return booking;
  }

  async getVendorBookingsByUserId(userId: number): Promise<VendorBooking[]> {
    return await db.select().from(vendorBookings).where(eq(vendorBookings.userId, userId));
  }

  async getVendorBookingsByVendorId(vendorId: number): Promise<VendorBooking[]> {
    return await db.select().from(vendorBookings).where(eq(vendorBookings.vendorId, vendorId));
  }

  async createVendorBooking(booking: InsertVendorBooking): Promise<VendorBooking> {
    const [newBooking] = await db.insert(vendorBookings).values(booking).returning();
    return newBooking;
  }

  async updateVendorBooking(id: number, bookingData: Partial<VendorBooking>): Promise<VendorBooking | undefined> {
    const [updatedBooking] = await db
      .update(vendorBookings)
      .set(bookingData)
      .where(eq(vendorBookings.id, id))
      .returning();
    return updatedBooking;
  }

  async deleteVendorBooking(id: number): Promise<boolean> {
    const result = await db.delete(vendorBookings).where(eq(vendorBookings.id, id));
    return !!result;
  }
}