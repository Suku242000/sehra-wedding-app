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

  // Achievement methods
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.category, category));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }

  async updateAchievement(id: number, achievementData: Partial<Achievement>): Promise<Achievement | undefined> {
    const [updatedAchievement] = await db
      .update(achievements)
      .set(achievementData)
      .where(eq(achievements.id, id))
      .returning();
    return updatedAchievement;
  }

  async deleteAchievement(id: number): Promise<boolean> {
    const result = await db.delete(achievements).where(eq(achievements.id, id));
    return !!result;
  }

  // User Achievement methods
  async getUserAchievement(id: number): Promise<UserAchievement | undefined> {
    const [userAchievement] = await db.select().from(userAchievements).where(eq(userAchievements.id, id));
    return userAchievement;
  }

  async getUserAchievementsByUserId(userId: number): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newUserAchievement] = await db.insert(userAchievements).values(userAchievement).returning();
    return newUserAchievement;
  }

  async updateUserAchievement(id: number, userAchievementData: Partial<UserAchievement>): Promise<UserAchievement | undefined> {
    const [updatedUserAchievement] = await db
      .update(userAchievements)
      .set(userAchievementData)
      .where(eq(userAchievements.id, id))
      .returning();
    return updatedUserAchievement;
  }

  // User Progress methods
  async getUserProgress(id: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.id, id));
    return progress;
  }

  async getUserProgressByUserId(userId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress;
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const [newProgress] = await db.insert(userProgress).values(progress).returning();
    return newProgress;
  }

  async updateUserProgress(id: number, progressData: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const [updatedProgress] = await db
      .update(userProgress)
      .set(progressData)
      .where(eq(userProgress.id, id))
      .returning();
    return updatedProgress;
  }

  // Timeline Event methods
  async getTimelineEvent(id: number): Promise<TimelineEvent | undefined> {
    const [event] = await db.select().from(timelineEvents).where(eq(timelineEvents.id, id));
    return event;
  }

  async getTimelineEventsByUserId(userId: number): Promise<TimelineEvent[]> {
    return await db.select()
      .from(timelineEvents)
      .where(eq(timelineEvents.userId, userId))
      .orderBy(timelineEvents.order);
  }

  async createTimelineEvent(timelineEvent: InsertTimelineEvent): Promise<TimelineEvent> {
    // Get the maximum order for this user
    const events = await this.getTimelineEventsByUserId(timelineEvent.userId);
    const maxOrder = events.length > 0 ? Math.max(...events.map(e => e.order)) : 0;
    
    // Set the order to be one more than the maximum
    const eventWithOrder = {
      ...timelineEvent,
      order: maxOrder + 1
    };
    
    const [newEvent] = await db.insert(timelineEvents).values(eventWithOrder).returning();
    return newEvent;
  }

  async updateTimelineEvent(id: number, eventData: Partial<TimelineEvent>): Promise<TimelineEvent | undefined> {
    const [updatedEvent] = await db
      .update(timelineEvents)
      .set(eventData)
      .where(eq(timelineEvents.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    const result = await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
    return !!result;
  }

  async reorderTimelineEvents(userId: number, eventIds: number[]): Promise<TimelineEvent[]> {
    // Validate that all events belong to this user
    const userEvents = await this.getTimelineEventsByUserId(userId);
    const userEventIds = userEvents.map(e => e.id);
    
    // Check if all provided event IDs belong to this user
    const allBelongToUser = eventIds.every(id => userEventIds.includes(id));
    if (!allBelongToUser) {
      throw new Error("Some events do not belong to this user");
    }
    
    // Update the order of each event
    for (let i = 0; i < eventIds.length; i++) {
      await db
        .update(timelineEvents)
        .set({ orderIndex: i + 1 })
        .where(eq(timelineEvents.id, eventIds[i]));
    }
    
    // Return the reordered events
    return await this.getTimelineEventsByUserId(userId);
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.fromUserId, userId1),
            eq(messages.toUserId, userId2)
          ),
          and(
            eq(messages.fromUserId, userId2),
            eq(messages.toUserId, userId1)
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async getUnreadMessagesForUser(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.toUserId, userId),
          eq(messages.read, false)
        )
      );
  }
  
  async getUnreadMessagesCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.toUserId, userId),
          eq(messages.read, false)
        )
      );
    return result[0]?.count || 0;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  async markAllMessagesAsRead(fromUserId: number, toUserId: number): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.fromUserId, fromUserId),
          eq(messages.toUserId, toUserId),
          eq(messages.read, false)
        )
      );
  }

  // Contact status methods
  async getContactStatus(id: number): Promise<ContactStatus | undefined> {
    const [status] = await db.select().from(contactStatus).where(eq(contactStatus.id, id));
    return status;
  }

  async getContactStatusByUserId(userId: number): Promise<ContactStatus | undefined> {
    const [status] = await db.select().from(contactStatus).where(eq(contactStatus.userId, userId));
    return status;
  }

  async getContactStatusesBySupervisorId(supervisorId: number): Promise<ContactStatus[]> {
    return await db
      .select()
      .from(contactStatus)
      .where(eq(contactStatus.supervisorId, supervisorId));
  }

  async createContactStatus(status: InsertContactStatus): Promise<ContactStatus> {
    const [newStatus] = await db.insert(contactStatus).values(status).returning();
    return newStatus;
  }

  async updateContactStatus(id: number, statusData: Partial<ContactStatus>): Promise<ContactStatus | undefined> {
    const [updatedStatus] = await db
      .update(contactStatus)
      .set({ ...statusData, lastUpdated: new Date() })
      .where(eq(contactStatus.id, id))
      .returning();
    return updatedStatus;
  }
}