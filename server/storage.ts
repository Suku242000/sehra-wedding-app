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

// Interface for storage methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUserCountByRoles(roles: string[]): Promise<number>;
  getUsersBySupervisorId(supervisorId: number): Promise<User[]>;
  
  // Vendor methods
  getVendorProfile(id: number): Promise<VendorProfile | undefined>;
  getVendorProfileByUserId(userId: number): Promise<VendorProfile | undefined>;
  createVendorProfile(profile: InsertVendorProfile): Promise<VendorProfile>;
  updateVendorProfile(id: number, profile: Partial<VendorProfile>): Promise<VendorProfile | undefined>;
  getAllVendorProfiles(): Promise<VendorProfile[]>;
  getVendorProfilesByType(type: string): Promise<VendorProfile[]>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getAllTasks(): Promise<Task[]>;
  
  // Guest methods
  getGuest(id: number): Promise<Guest | undefined>;
  getGuestsByUserId(userId: number): Promise<Guest[]>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: number, guest: Partial<Guest>): Promise<Guest | undefined>;
  deleteGuest(id: number): Promise<boolean>;
  getAllGuests(): Promise<Guest[]>;
  
  // Budget methods
  getBudgetItem(id: number): Promise<BudgetItem | undefined>;
  getBudgetItemsByUserId(userId: number): Promise<BudgetItem[]>;
  createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: number, item: Partial<BudgetItem>): Promise<BudgetItem | undefined>;
  deleteBudgetItem(id: number): Promise<boolean>;
  getAllBudgetItems(): Promise<BudgetItem[]>;
  
  // Vendor booking methods
  getVendorBooking(id: number): Promise<VendorBooking | undefined>;
  getVendorBookingsByUserId(userId: number): Promise<VendorBooking[]>;
  getVendorBookingsByVendorId(vendorId: number): Promise<VendorBooking[]>;
  createVendorBooking(booking: InsertVendorBooking): Promise<VendorBooking>;
  updateVendorBooking(id: number, booking: Partial<VendorBooking>): Promise<VendorBooking | undefined>;
  deleteVendorBooking(id: number): Promise<boolean>;
  getAllVendorBookings(): Promise<VendorBooking[]>;
  
  // Achievement methods
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementsByCategory(category: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, achievement: Partial<Achievement>): Promise<Achievement | undefined>;
  deleteAchievement(id: number): Promise<boolean>;
  
  // User Achievement methods
  getUserAchievement(id: number): Promise<UserAchievement | undefined>;
  getUserAchievementsByUserId(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievement(id: number, userAchievement: Partial<UserAchievement>): Promise<UserAchievement | undefined>;
  
  // User Progress methods
  getUserProgress(id: number): Promise<UserProgress | undefined>;
  getUserProgressByUserId(userId: number): Promise<UserProgress | undefined>;
  createUserProgress(userProgress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: number, userProgress: Partial<UserProgress>): Promise<UserProgress | undefined>;
  
  // Timeline Event methods
  getTimelineEvent(id: number): Promise<TimelineEvent | undefined>;
  getTimelineEventsByUserId(userId: number): Promise<TimelineEvent[]>;
  createTimelineEvent(timelineEvent: InsertTimelineEvent): Promise<TimelineEvent>;
  updateTimelineEvent(id: number, timelineEvent: Partial<TimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteTimelineEvent(id: number): Promise<boolean>;
  reorderTimelineEvents(userId: number, eventIds: number[]): Promise<TimelineEvent[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vendorProfiles: Map<number, VendorProfile>;
  private tasks: Map<number, Task>;
  private guests: Map<number, Guest>;
  private budgetItems: Map<number, BudgetItem>;
  private vendorBookings: Map<number, VendorBooking>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private userProgress: Map<number, UserProgress>;
  private timelineEvents: Map<number, TimelineEvent>;
  
  private userId: number;
  private vendorProfileId: number;
  private taskId: number;
  private guestId: number;
  private budgetItemId: number;
  private vendorBookingId: number;
  private achievementId: number;
  private userAchievementId: number;
  private userProgressId: number;
  private timelineEventId: number;

  constructor() {
    this.users = new Map();
    this.vendorProfiles = new Map();
    this.tasks = new Map();
    this.guests = new Map();
    this.budgetItems = new Map();
    this.vendorBookings = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.userProgress = new Map();
    this.timelineEvents = new Map();
    
    this.userId = 1;
    this.vendorProfileId = 1;
    this.taskId = 1;
    this.guestId = 1;
    this.budgetItemId = 1;
    this.vendorBookingId = 1;
    this.achievementId = 1;
    this.userAchievementId = 1;
    this.userProgressId = 1;
    this.timelineEventId = 1;
    
    // Initialize with admin user
    this.createUser({
      name: "Admin User",
      email: "admin@sehra.com",
      password: "$2a$10$GQxWsXdRl4i51MQoWmEbk.j86BK/xXlKwE4qUlEb9EmZRMxEKgIJS", // "admin123"
      role: "admin",
    });
    
    // Initialize with supervisor user
    const supervisorId = this.userId;
    this.createUser({
      name: "Anjali Sharma",
      email: "anjali@sehra.com",
      password: "$2a$10$GQxWsXdRl4i51MQoWmEbk.j86BK/xXlKwE4qUlEb9EmZRMxEKgIJS", // "admin123"
      role: "supervisor",
    });
    
    // Initialize with some vendor users
    ["Hotel Royal Palace", "Memories Photography", "Divine Decor"].forEach((name, index) => {
      const vendorId = this.userId;
      this.createUser({
        name,
        email: `vendor${index + 1}@sehra.com`,
        password: "$2a$10$GQxWsXdRl4i51MQoWmEbk.j86BK/xXlKwE4qUlEb9EmZRMxEKgIJS", // "admin123"
        role: "vendor",
      });
      
      this.createVendorProfile({
        userId: vendorId,
        vendorType: ["hotel", "photographer", "decoration"][index],
        businessName: name,
        description: `${name} - A premium wedding service provider`,
        location: "Delhi, India",
        portfolio: [],
        priceRange: "₹50,000 - ₹5,00,000",
        availability: ["2023-11-01", "2023-11-15", "2023-12-01"],
        rating: 4,
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date().toISOString();
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: now,
      customerId: user.customerId || `SEHRA${String(id).padStart(4, '0')}`,
      supervisorId: user.supervisorId || 2, // Default supervisor ID
      package: user.package || null,
      weddingDate: user.weddingDate || null
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === role
    );
  }
  
  async getUserCountByRoles(roles: string[]): Promise<number> {
    return Array.from(this.users.values()).filter(
      (user) => roles.includes(user.role)
    ).length;
  }

  async getUsersBySupervisorId(supervisorId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.supervisorId === supervisorId
    );
  }

  // Vendor methods
  async getVendorProfile(id: number): Promise<VendorProfile | undefined> {
    return this.vendorProfiles.get(id);
  }

  async getVendorProfileByUserId(userId: number): Promise<VendorProfile | undefined> {
    return Array.from(this.vendorProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createVendorProfile(profile: InsertVendorProfile): Promise<VendorProfile> {
    const id = this.vendorProfileId++;
    const now = new Date().toISOString();
    const newProfile: VendorProfile = { ...profile, id, createdAt: now };
    this.vendorProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateVendorProfile(id: number, profileData: Partial<VendorProfile>): Promise<VendorProfile | undefined> {
    const profile = await this.getVendorProfile(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileData };
    this.vendorProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async getAllVendorProfiles(): Promise<VendorProfile[]> {
    return Array.from(this.vendorProfiles.values());
  }

  async getVendorProfilesByType(type: string): Promise<VendorProfile[]> {
    return Array.from(this.vendorProfiles.values()).filter(
      (profile) => profile.vendorType === type
    );
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const now = new Date().toISOString();
    const newTask: Task = { ...task, id, createdAt: now };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  // Guest methods
  async getGuest(id: number): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async getGuestsByUserId(userId: number): Promise<Guest[]> {
    return Array.from(this.guests.values()).filter(
      (guest) => guest.userId === userId
    );
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const id = this.guestId++;
    const now = new Date().toISOString();
    const newGuest: Guest = { ...guest, id, createdAt: now };
    this.guests.set(id, newGuest);
    return newGuest;
  }

  async updateGuest(id: number, guestData: Partial<Guest>): Promise<Guest | undefined> {
    const guest = await this.getGuest(id);
    if (!guest) return undefined;
    
    const updatedGuest = { ...guest, ...guestData };
    this.guests.set(id, updatedGuest);
    return updatedGuest;
  }

  async deleteGuest(id: number): Promise<boolean> {
    return this.guests.delete(id);
  }
  
  async getAllGuests(): Promise<Guest[]> {
    return Array.from(this.guests.values());
  }

  // Budget methods
  async getBudgetItem(id: number): Promise<BudgetItem | undefined> {
    return this.budgetItems.get(id);
  }

  async getBudgetItemsByUserId(userId: number): Promise<BudgetItem[]> {
    return Array.from(this.budgetItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem> {
    const id = this.budgetItemId++;
    const now = new Date().toISOString();
    const newItem: BudgetItem = { ...item, id, createdAt: now };
    this.budgetItems.set(id, newItem);
    return newItem;
  }

  async updateBudgetItem(id: number, itemData: Partial<BudgetItem>): Promise<BudgetItem | undefined> {
    const item = await this.getBudgetItem(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...itemData };
    this.budgetItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteBudgetItem(id: number): Promise<boolean> {
    return this.budgetItems.delete(id);
  }
  
  async getAllBudgetItems(): Promise<BudgetItem[]> {
    return Array.from(this.budgetItems.values());
  }

  // Vendor booking methods
  async getVendorBooking(id: number): Promise<VendorBooking | undefined> {
    return this.vendorBookings.get(id);
  }

  async getVendorBookingsByUserId(userId: number): Promise<VendorBooking[]> {
    return Array.from(this.vendorBookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async getVendorBookingsByVendorId(vendorId: number): Promise<VendorBooking[]> {
    return Array.from(this.vendorBookings.values()).filter(
      (booking) => booking.vendorId === vendorId
    );
  }

  async createVendorBooking(booking: InsertVendorBooking): Promise<VendorBooking> {
    const id = this.vendorBookingId++;
    const now = new Date().toISOString();
    const newBooking: VendorBooking = { ...booking, id, createdAt: now };
    this.vendorBookings.set(id, newBooking);
    return newBooking;
  }

  async updateVendorBooking(id: number, bookingData: Partial<VendorBooking>): Promise<VendorBooking | undefined> {
    const booking = await this.getVendorBooking(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingData };
    this.vendorBookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteVendorBooking(id: number): Promise<boolean> {
    return this.vendorBookings.delete(id);
  }
  
  async getAllVendorBookings(): Promise<VendorBooking[]> {
    return Array.from(this.vendorBookings.values());
  }
  
  // Achievement methods
  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      (achievement) => achievement.category === category
    );
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementId++;
    const now = new Date().toISOString();
    const newAchievement: Achievement = { ...achievement, id, createdAt: now };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async updateAchievement(id: number, achievementData: Partial<Achievement>): Promise<Achievement | undefined> {
    const achievement = await this.getAchievement(id);
    if (!achievement) return undefined;
    
    const updatedAchievement = { ...achievement, ...achievementData };
    this.achievements.set(id, updatedAchievement);
    return updatedAchievement;
  }

  async deleteAchievement(id: number): Promise<boolean> {
    return this.achievements.delete(id);
  }

  // User Achievement methods
  async getUserAchievement(id: number): Promise<UserAchievement | undefined> {
    return this.userAchievements.get(id);
  }

  async getUserAchievementsByUserId(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(
      (userAchievement) => userAchievement.userId === userId
    );
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementId++;
    const now = new Date().toISOString();
    const newUserAchievement: UserAchievement = { 
      ...userAchievement, 
      id, 
      unlockedAt: now,
      displayed: userAchievement.displayed || false,
      sharedSocial: userAchievement.sharedSocial || false
    };
    this.userAchievements.set(id, newUserAchievement);
    return newUserAchievement;
  }

  async updateUserAchievement(id: number, userAchievementData: Partial<UserAchievement>): Promise<UserAchievement | undefined> {
    const userAchievement = await this.getUserAchievement(id);
    if (!userAchievement) return undefined;
    
    const updatedUserAchievement = { ...userAchievement, ...userAchievementData };
    this.userAchievements.set(id, updatedUserAchievement);
    return updatedUserAchievement;
  }

  // User Progress methods
  async getUserProgress(id: number): Promise<UserProgress | undefined> {
    return this.userProgress.get(id);
  }

  async getUserProgressByUserId(userId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      (progress) => progress.userId === userId
    );
  }

  async createUserProgress(userProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.userProgressId++;
    const now = new Date().toISOString();
    const newUserProgress: UserProgress = { 
      ...userProgress, 
      id, 
      lastActive: now,
      totalPoints: userProgress.totalPoints || 0,
      level: userProgress.level || 1,
      tasksCompleted: userProgress.tasksCompleted || 0,
      checklistProgress: userProgress.checklistProgress || 0,
      budgetHealth: userProgress.budgetHealth || 100,
      budgetMood: userProgress.budgetMood || 'neutral',
      streak: userProgress.streak || 0
    };
    this.userProgress.set(id, newUserProgress);
    return newUserProgress;
  }

  async updateUserProgress(id: number, userProgressData: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const userProgress = await this.getUserProgress(id);
    if (!userProgress) return undefined;
    
    const updatedUserProgress = { ...userProgress, ...userProgressData };
    this.userProgress.set(id, updatedUserProgress);
    return updatedUserProgress;
  }

  // Timeline Event methods
  async getTimelineEvent(id: number): Promise<TimelineEvent | undefined> {
    return this.timelineEvents.get(id);
  }

  async getTimelineEventsByUserId(userId: number): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values())
      .filter((event) => event.userId === userId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  async createTimelineEvent(timelineEvent: InsertTimelineEvent): Promise<TimelineEvent> {
    const id = this.timelineEventId++;
    const now = new Date().toISOString();
    
    // Get the highest order index for this user
    const userEvents = await this.getTimelineEventsByUserId(timelineEvent.userId);
    const maxOrderIndex = userEvents.length > 0
      ? Math.max(...userEvents.map(e => e.orderIndex || 0))
      : -1;
    
    const newTimelineEvent: TimelineEvent = { 
      ...timelineEvent, 
      id, 
      createdAt: now,
      completed: timelineEvent.completed || false,
      orderIndex: timelineEvent.orderIndex ?? maxOrderIndex + 1
    };
    this.timelineEvents.set(id, newTimelineEvent);
    return newTimelineEvent;
  }

  async updateTimelineEvent(id: number, timelineEventData: Partial<TimelineEvent>): Promise<TimelineEvent | undefined> {
    const timelineEvent = await this.getTimelineEvent(id);
    if (!timelineEvent) return undefined;
    
    const updatedTimelineEvent = { ...timelineEvent, ...timelineEventData };
    this.timelineEvents.set(id, updatedTimelineEvent);
    return updatedTimelineEvent;
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    return this.timelineEvents.delete(id);
  }
  
  async reorderTimelineEvents(userId: number, eventIds: number[]): Promise<TimelineEvent[]> {
    // Check if all events exist and belong to the user
    const events = await Promise.all(eventIds.map(id => this.getTimelineEvent(id)));
    const validEvents = events.filter(
      (event): event is TimelineEvent => 
        event !== undefined && event.userId === userId
    );
    
    if (validEvents.length !== eventIds.length) {
      throw new Error("Some events don't exist or don't belong to the user");
    }
    
    // Update order index for each event
    const updatedEvents = await Promise.all(
      eventIds.map((id, index) => 
        this.updateTimelineEvent(id, { orderIndex: index })
      )
    );
    
    // Return events in the new order
    return updatedEvents.filter((event): event is TimelineEvent => event !== undefined);
  }
}

// Import the DatabaseStorage class
import { DatabaseStorage } from './database-storage';

// Export the storage instance (using DatabaseStorage instead of MemStorage)
export const storage = new DatabaseStorage();
