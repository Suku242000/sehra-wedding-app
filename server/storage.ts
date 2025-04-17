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
  Message,
  InsertMessage,
  ContactStatus,
  InsertContactStatus,
  Notification,
  VendorReview,
  InsertVendorReview,
  VendorCalendar,
  InsertVendorCalendar,
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
  notifications,
  vendorReviews,
  vendorCalendar
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
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  getMessagesBetweenUsers(fromUserId: number, toUserId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(fromUserId: number, toUserId: number): Promise<boolean>;
  getUnreadMessageCount(userId: number): Promise<number>;
  getLastMessages(userId: number): Promise<any[]>;
  
  // Contact Status methods
  getContactStatus(userId: number, supervisorId: number): Promise<ContactStatus | undefined>;
  createContactStatus(contactStatus: InsertContactStatus): Promise<ContactStatus>;
  updateContactStatus(userId: number, supervisorId: number, data: Partial<ContactStatus>): Promise<ContactStatus | undefined>;
  
  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: Notification): Promise<Notification>;
  updateNotification(id: number, notification: Partial<Notification>): Promise<Notification | undefined>;
  markNotificationsAsRead(userId: number): Promise<boolean>;
  
  // Vendor Review methods
  getVendorReview(id: number): Promise<VendorReview | undefined>;
  getVendorReviewsByVendorId(vendorId: number): Promise<VendorReview[]>;
  getVendorReviewsByUserId(userId: number): Promise<VendorReview[]>;
  createVendorReview(review: InsertVendorReview): Promise<VendorReview>;
  updateVendorReview(id: number, review: Partial<VendorReview>): Promise<VendorReview | undefined>;
  
  // Vendor Calendar methods
  getVendorCalendarEntry(id: number): Promise<VendorCalendar | undefined>;
  getVendorCalendarByVendorId(vendorId: number): Promise<VendorCalendar[]>;
  getVendorCalendarByDateRange(vendorId: number, startDate: Date, endDate: Date): Promise<VendorCalendar[]>;
  createVendorCalendarEntry(calendarEntry: InsertVendorCalendar): Promise<VendorCalendar>;
  updateVendorCalendarEntry(id: number, calendarEntry: Partial<VendorCalendar>): Promise<VendorCalendar | undefined>;
  deleteVendorCalendarEntry(id: number): Promise<boolean>;
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
  private messages: Map<number, Message>;
  private notifications: Map<number, Notification>;
  private contactStatuses: Map<string, ContactStatus>;
  private vendorReviews: Map<number, VendorReview>;
  private vendorCalendars: Map<number, VendorCalendar>;
  
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
  private messageId: number;
  private notificationId: number;
  private vendorReviewId: number;
  private vendorCalendarId: number;

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
    this.messages = new Map();
    this.notifications = new Map();
    this.contactStatuses = new Map();
    this.vendorReviews = new Map();
    this.vendorCalendars = new Map();
    
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
    this.messageId = 1;
    this.notificationId = 1;
    this.vendorReviewId = 1;
    this.vendorCalendarId = 1;
    
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
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.fromUserId === userId || message.toUserId === userId
    );
  }

  async getMessagesBetweenUsers(fromUserId: number, toUserId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => 
        (message.fromUserId === fromUserId && message.toUserId === toUserId) ||
        (message.fromUserId === toUserId && message.toUserId === fromUserId)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date().toISOString();
    const newMessage: Message = { 
      ...message, 
      id, 
      createdAt: now,
      read: message.read || false
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessagesAsRead(fromUserId: number, toUserId: number): Promise<boolean> {
    const messages = await this.getMessagesBetweenUsers(fromUserId, toUserId);
    const unreadMessages = messages.filter(
      (message) => message.fromUserId === fromUserId && !message.read
    );
    
    for (const message of unreadMessages) {
      await this.updateMessage(message.id, { read: true });
    }
    
    return true;
  }

  async updateMessage(id: number, messageData: Partial<Message>): Promise<Message | undefined> {
    const message = await this.getMessage(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...messageData };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.messages.values()).filter(
      (message) => message.toUserId === userId && !message.read
    ).length;
  }

  async getLastMessages(userId: number): Promise<any[]> {
    const messages = Array.from(this.messages.values()).filter(
      (message) => message.fromUserId === userId || message.toUserId === userId
    );
    
    // Get unique user IDs from messages
    const userIds = new Set<number>();
    messages.forEach(message => {
      if (message.fromUserId !== userId) userIds.add(message.fromUserId);
      if (message.toUserId !== userId) userIds.add(message.toUserId);
    });
    
    // Get last message for each user
    const lastMessages = [];
    for (const id of userIds) {
      const userMessages = messages.filter(
        message => message.fromUserId === id || message.toUserId === id
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (userMessages.length > 0) {
        const lastMessage = userMessages[0];
        const unreadCount = userMessages.filter(
          message => message.fromUserId === id && !message.read
        ).length;
        
        lastMessages.push({
          userId: id,
          message: lastMessage,
          unreadCount
        });
      }
    }
    
    return lastMessages;
  }
  
  // Contact Status methods
  async getContactStatus(userId: number, supervisorId: number): Promise<ContactStatus | undefined> {
    return this.contactStatuses.get(`${userId}-${supervisorId}`);
  }

  async createContactStatus(contactStatus: InsertContactStatus): Promise<ContactStatus> {
    const key = `${contactStatus.userId}-${contactStatus.supervisorId}`;
    const now = new Date().toISOString();
    const newContactStatus: ContactStatus = { 
      ...contactStatus, 
      id: contactStatus.userId, // Using userId as the ID since it's a 1-to-1 relationship
      lastUpdated: now,
      contactComplete: contactStatus.contactComplete || false,
      supervisorStatus: contactStatus.supervisorStatus || 'pending'
    };
    this.contactStatuses.set(key, newContactStatus);
    return newContactStatus;
  }

  async updateContactStatus(userId: number, supervisorId: number, data: Partial<ContactStatus>): Promise<ContactStatus | undefined> {
    const key = `${userId}-${supervisorId}`;
    const contactStatus = await this.getContactStatus(userId, supervisorId);
    if (!contactStatus) return undefined;
    
    const now = new Date().toISOString();
    const updatedContactStatus = { 
      ...contactStatus, 
      ...data,
      lastUpdated: now
    };
    this.contactStatuses.set(key, updatedContactStatus);
    return updatedContactStatus;
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notification: Notification): Promise<Notification> {
    const id = this.notificationId++;
    const now = new Date().toISOString();
    const newNotification: Notification = { 
      ...notification, 
      id, 
      createdAt: now,
      read: notification.read || false
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined> {
    const notification = await this.getNotification(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, ...data };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async markNotificationsAsRead(userId: number): Promise<boolean> {
    const notifications = await this.getNotificationsByUserId(userId);
    const unreadNotifications = notifications.filter(notification => !notification.read);
    
    for (const notification of unreadNotifications) {
      await this.updateNotification(notification.id, { read: true });
    }
    
    return true;
  }

  // Vendor Review methods
  async getVendorReview(id: number): Promise<VendorReview | undefined> {
    return this.vendorReviews.get(id);
  }

  async getVendorReviewsByVendorId(vendorId: number): Promise<VendorReview[]> {
    return Array.from(this.vendorReviews.values())
      .filter(review => review.vendorId === vendorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getVendorReviewsByUserId(userId: number): Promise<VendorReview[]> {
    return Array.from(this.vendorReviews.values())
      .filter(review => review.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createVendorReview(review: InsertVendorReview): Promise<VendorReview> {
    const id = this.vendorReviewId++;
    const now = new Date().toISOString();
    const newReview: VendorReview = { 
      ...review, 
      id, 
      createdAt: now
    };
    this.vendorReviews.set(id, newReview);
    
    // Update the vendor's average rating
    const vendorId = review.vendorId;
    const vendorProfile = await this.getVendorProfileByUserId(vendorId);
    if (vendorProfile) {
      const reviews = await this.getVendorReviewsByVendorId(vendorId);
      const avgRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;
      await this.updateVendorProfile(vendorProfile.id, { rating: avgRating });
    }
    
    return newReview;
  }

  async updateVendorReview(id: number, reviewData: Partial<VendorReview>): Promise<VendorReview | undefined> {
    const review = await this.getVendorReview(id);
    if (!review) return undefined;
    
    const updatedReview = { ...review, ...reviewData };
    this.vendorReviews.set(id, updatedReview);
    
    // Update the vendor's average rating if the rating changed
    if (reviewData.overallRating) {
      const vendorId = review.vendorId;
      const vendorProfile = await this.getVendorProfileByUserId(vendorId);
      if (vendorProfile) {
        const reviews = await this.getVendorReviewsByVendorId(vendorId);
        const avgRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;
        await this.updateVendorProfile(vendorProfile.id, { rating: avgRating });
      }
    }
    
    return updatedReview;
  }
  
  // Vendor Calendar methods
  async getVendorCalendarEntry(id: number): Promise<VendorCalendar | undefined> {
    return this.vendorCalendars.get(id);
  }

  async getVendorCalendarByVendorId(vendorId: number): Promise<VendorCalendar[]> {
    return Array.from(this.vendorCalendars.values())
      .filter(entry => entry.vendorId === vendorId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getVendorCalendarByDateRange(vendorId: number, startDate: Date, endDate: Date): Promise<VendorCalendar[]> {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    
    return Array.from(this.vendorCalendars.values())
      .filter(entry => {
        const entryTimestamp = new Date(entry.date).getTime();
        return entry.vendorId === vendorId && 
               entryTimestamp >= startTimestamp && 
               entryTimestamp <= endTimestamp;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createVendorCalendarEntry(calendarEntry: InsertVendorCalendar): Promise<VendorCalendar> {
    const id = this.vendorCalendarId++;
    const now = new Date().toISOString();
    const newCalendarEntry: VendorCalendar = { 
      ...calendarEntry, 
      id, 
      createdAt: now,
      updatedAt: now,
      bookingId: calendarEntry.bookingId || null,
      notes: calendarEntry.notes || null
    };
    this.vendorCalendars.set(id, newCalendarEntry);
    return newCalendarEntry;
  }

  async updateVendorCalendarEntry(id: number, calendarEntry: Partial<VendorCalendar>): Promise<VendorCalendar | undefined> {
    const entry = await this.getVendorCalendarEntry(id);
    if (!entry) return undefined;
    
    const now = new Date().toISOString();
    const updatedEntry = { 
      ...entry, 
      ...calendarEntry,
      updatedAt: now
    };
    this.vendorCalendars.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteVendorCalendarEntry(id: number): Promise<boolean> {
    return this.vendorCalendars.delete(id);
  }
}

// Import the DatabaseStorage class
import { DatabaseStorage } from './database-storage';

// Export the storage instance (using DatabaseStorage instead of MemStorage)
export const storage = new DatabaseStorage();
