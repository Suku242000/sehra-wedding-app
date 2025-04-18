import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { WebSocket } from "ws";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  loginSchema, 
  registerSchema, 
  packageSelectionSchema, 
  insertTaskSchema,
  insertGuestSchema,
  insertBudgetItemSchema,
  insertVendorBookingSchema,
  insertVendorProfileSchema,
  insertAchievementSchema,
  insertUserAchievementSchema,
  insertUserProgressSchema,
  insertTimelineEventSchema,
  insertMessageSchema,
  insertVendorCalendarSchema,
  insertContactStatusSchema,
  insertContactFormSubmissionSchema,
  UserRole
} from "@shared/schema";
import { 
  authenticateToken, 
  authorizeRoles, 
  generateToken, 
  verifyPassword, 
  hashPassword,
  verifyToken
} from "./utils/auth";
import {
  sendWelcomeEmail,
  sendTaskReminderEmail,
  sendBookingConfirmationEmail,
  sendSupervisorAllocationEmail,
  sendSupervisorNotificationEmail,
  initializeEmailTransport
} from "./utils/email";

// Initialize email transport
initializeEmailTransport();

// Import admin dashboard routes
import adminDashboardRoutes from './routes/admin-dashboard';

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP and Socket.IO servers
  const httpServer = createServer(app);
  
  // Remove the internal app routing interception
  // We should let the Vite dev server handle internal app requests naturally
  
  // Initialize Socket.IO with CORS settings
  const io = new SocketIOServer(httpServer, {
    path: '/ws',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Add staff login route for internal application
  app.post("/api/staff/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(validatedData.email);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // Check if user is staff (admin, vendor, or supervisor)
      if (!['admin', 'vendor', 'supervisor'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied. Staff only." });
      }
      
      // Verify password
      const isPasswordValid = await verifyPassword(
        validatedData.password,
        user.password
      );
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // Generate token
      const token = generateToken(user);
      
      // Return user data (excluding password) and token
      const { password, ...userData } = user;
      res.json({ user: userData, token });
    } catch (error) {
      console.error("Staff login error:", error);
      res.status(500).json({ message: "An error occurred during login" });
    }
  });
  
  // Get staff user profile
  app.get("/api/staff/user", authenticateToken, async (req: Request, res: Response) => {
    try {
      // User is already attached to request by authenticateToken middleware
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only staff roles can access this endpoint
      if (!['admin', 'vendor', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied. Staff only." });
      }
      
      // Return user data from the database to ensure we have the latest data
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data excluding password
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Get staff user error:", error);
      res.status(500).json({ message: "An error occurred while fetching user data" });
    }
  });
  
  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Generate unique ID based on role
      let uniqueId = "";
      
      // For customer roles (bride, groom, family)
      if ([UserRole.BRIDE, UserRole.GROOM, UserRole.FAMILY].includes(validatedData.role)) {
        const customerCount = await storage.getUserCountByRoles([UserRole.BRIDE, UserRole.GROOM, UserRole.FAMILY]);
        // Adding timestamp to ensure uniqueness
        uniqueId = `SC${(customerCount + 1 + Date.now() % 1000).toString().padStart(4, '0')}`;
      } 
      // For vendor role
      else if (validatedData.role === UserRole.VENDOR) {
        const vendorCount = await storage.getUserCountByRoles([UserRole.VENDOR]);
        // Adding timestamp to ensure uniqueness
        uniqueId = `SV${(vendorCount + 1 + Date.now() % 1000).toString().padStart(4, '0')}`;
      }
      // For admin role
      else if (validatedData.role === UserRole.ADMIN) {
        const adminCount = await storage.getUserCountByRoles([UserRole.ADMIN]);
        // Adding timestamp to ensure uniqueness
        uniqueId = `SA${(adminCount + 1 + Date.now() % 1000).toString().padStart(4, '0')}`;
      }
      // For supervisor role
      else if (validatedData.role === UserRole.SUPERVISOR) {
        const supervisorCount = await storage.getUserCountByRoles([UserRole.SUPERVISOR]);
        // Adding timestamp to ensure uniqueness
        uniqueId = `SP${(supervisorCount + 1 + Date.now() % 1000).toString().padStart(4, '0')}`;
      }
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        uniqueId: uniqueId || undefined,
      });
      
      // Generate token
      const token = generateToken(user);
      
      // Send welcome email
      await sendWelcomeEmail(user.name, user.email, user.role);
      
      // Return user data (excluding password) and token
      const { password, ...userData } = user;
      res.status(201).json({ user: userData, token });
    } catch (error) {
      console.error("Registration error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      console.log("Login attempt with:", { email: req.body.email, password: req.body.password ? "******" : undefined });
      
      const validatedData = loginSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(validatedData.email);
      console.log("User found:", user ? { id: user.id, email: user.email, role: user.role } : "No user found");
      
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      console.log("Attempting password verification with provided password and hash:", { 
        providedPasswordLength: validatedData.password.length,
        storedHashFormat: user.password.substring(0, 10) + "..." 
      });
      
      const isPasswordValid = await verifyPassword(
        validatedData.password,
        user.password
      );
      
      console.log("Password verification result:", isPasswordValid);
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // Generate token
      const token = generateToken(user);
      console.log("Login successful, token generated");
      
      // Return user data (excluding password) and token
      const { password, ...userData } = user;
      res.json({ user: userData, token });
    } catch (error) {
      console.error("Login error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/select-package", authenticateToken, async (req: Request, res: Response) => {
    try {
      const validatedData = packageSelectionSchema.parse(req.body);
      const userId = req.user.id;
      
      // Update user's package
      const updatedUser = await storage.updateUser(userId, {
        package: validatedData.package,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return updated user data (excluding password)
      const { password, ...userData } = updatedUser;
      res.json({ user: userData });
    } catch (error) {
      console.error("Package selection error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to select package" });
    }
  });

  // Task routes
  app.get("/api/tasks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({ message: "Failed to retrieve tasks" });
    }
  });

  app.post("/api/tasks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTaskSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Create task error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if task exists and belongs to user
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to update this task" });
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if task exists and belongs to user
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to delete this task" });
      }
      
      await storage.deleteTask(taskId);
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Guest routes
  app.get("/api/guests", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const guests = await storage.getGuestsByUserId(userId);
      res.json(guests);
    } catch (error) {
      console.error("Get guests error:", error);
      res.status(500).json({ message: "Failed to retrieve guests" });
    }
  });

  app.post("/api/guests", authenticateToken, async (req: Request, res: Response) => {
    try {
      const validatedData = insertGuestSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const guest = await storage.createGuest(validatedData);
      res.status(201).json(guest);
    } catch (error) {
      console.error("Create guest error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create guest" });
    }
  });

  app.patch("/api/guests/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const guestId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if guest exists and belongs to user
      const guest = await storage.getGuest(guestId);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      if (guest.userId !== userId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to update this guest" });
      }
      
      const updatedGuest = await storage.updateGuest(guestId, req.body);
      res.json(updatedGuest);
    } catch (error) {
      console.error("Update guest error:", error);
      res.status(500).json({ message: "Failed to update guest" });
    }
  });

  app.delete("/api/guests/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const guestId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if guest exists and belongs to user
      const guest = await storage.getGuest(guestId);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      if (guest.userId !== userId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to delete this guest" });
      }
      
      await storage.deleteGuest(guestId);
      res.json({ message: "Guest deleted successfully" });
    } catch (error) {
      console.error("Delete guest error:", error);
      res.status(500).json({ message: "Failed to delete guest" });
    }
  });

  // Budget routes
  app.get("/api/budget", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const budgetItems = await storage.getBudgetItemsByUserId(userId);
      res.json(budgetItems);
    } catch (error) {
      console.error("Get budget items error:", error);
      res.status(500).json({ message: "Failed to retrieve budget items" });
    }
  });

  app.post("/api/budget", authenticateToken, async (req: Request, res: Response) => {
    try {
      const validatedData = insertBudgetItemSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const budgetItem = await storage.createBudgetItem(validatedData);
      res.status(201).json(budgetItem);
    } catch (error) {
      console.error("Create budget item error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create budget item" });
    }
  });

  app.patch("/api/budget/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if budget item exists and belongs to user
      const budgetItem = await storage.getBudgetItem(itemId);
      if (!budgetItem) {
        return res.status(404).json({ message: "Budget item not found" });
      }
      
      if (budgetItem.userId !== userId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to update this budget item" });
      }
      
      const updatedBudgetItem = await storage.updateBudgetItem(itemId, req.body);
      res.json(updatedBudgetItem);
    } catch (error) {
      console.error("Update budget item error:", error);
      res.status(500).json({ message: "Failed to update budget item" });
    }
  });

  app.delete("/api/budget/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if budget item exists and belongs to user
      const budgetItem = await storage.getBudgetItem(itemId);
      if (!budgetItem) {
        return res.status(404).json({ message: "Budget item not found" });
      }
      
      if (budgetItem.userId !== userId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to delete this budget item" });
      }
      
      await storage.deleteBudgetItem(itemId);
      res.json({ message: "Budget item deleted successfully" });
    } catch (error) {
      console.error("Delete budget item error:", error);
      res.status(500).json({ message: "Failed to delete budget item" });
    }
  });

  // Vendor routes
  // Get all vendors - public access
  app.get("/api/vendors", async (req: Request, res: Response) => {
    try {
      const vendors = await storage.getAllVendorProfiles();
      
      // If type is specified, filter by type
      const { type } = req.query;
      
      if (type) {
        const filteredVendors = vendors.filter(vendor => vendor.vendorType === type);
        return res.json(filteredVendors);
      }
      
      // Sort featured vendors first
      const sortedVendors = vendors.sort((a, b) => {
        // First sort by featured status
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then sort by verification status
        if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
        if (a.verificationStatus !== 'verified' && b.verificationStatus === 'verified') return 1;
        // Finally sort by rating (highest first)
        return (b.rating || 0) - (a.rating || 0);
      });
      res.json(sortedVendors);
    } catch (error) {
      console.error("Get all vendors error:", error);
      res.status(500).json({ message: "Failed to retrieve vendors" });
    }
  });

  // Get vendors by type
  app.get("/api/vendors/type/:vendorType", async (req: Request, res: Response) => {
    try {
      const { vendorType } = req.params;
      const vendors = await storage.getVendorProfilesByType(vendorType);
      res.json(vendors);
    } catch (error) {
      console.error("Get vendors by type error:", error);
      res.status(500).json({ message: "Failed to retrieve vendors" });
    }
  });

  // Get vendor by ID
  app.get("/api/vendors/:id", async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const vendor = await storage.getVendorProfile(vendorId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Get vendor reviews
      const reviews = await storage.getVendorReviewsByVendorId(vendorId);
      
      // Combine vendor profile with reviews
      const vendorWithReviews = {
        ...vendor,
        reviews: reviews || []
      };
      
      res.json(vendorWithReviews);
    } catch (error) {
      console.error("Get vendor error:", error);
      res.status(500).json({ message: "Failed to retrieve vendor" });
    }
  });

  // Get current vendor's profile
  app.get("/api/vendors/my-profile", authenticateToken, authorizeRoles([UserRole.VENDOR]), async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const vendorProfile = await storage.getVendorProfileByUserId(userId);
      
      if (!vendorProfile) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      res.json(vendorProfile);
    } catch (error) {
      console.error("Get vendor profile error:", error);
      res.status(500).json({ message: "Failed to retrieve vendor profile" });
    }
  });

  // Create vendor profile
  app.post("/api/vendors", authenticateToken, authorizeRoles([UserRole.VENDOR]), async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Check if vendor profile already exists
      const existingProfile = await storage.getVendorProfileByUserId(userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Vendor profile already exists" });
      }
      
      const validatedData = insertVendorProfileSchema.parse({
        ...req.body,
        userId,
        profileComplete: true, // Mark profile as complete upon creation
        verificationStatus: 'pending',
      });
      
      const vendorProfile = await storage.createVendorProfile(validatedData);

      // Create notification for admin about new vendor registration
      const adminUsers = await storage.getUsersByRole(UserRole.ADMIN);
      if (adminUsers && adminUsers.length > 0) {
        for (const admin of adminUsers) {
          await storage.createNotification({
            userId: admin.id,
            title: "New Vendor Registration",
            content: `Vendor ${vendorProfile.businessName} has registered and is pending verification.`,
            type: "vendor",
            isRead: false,
            relatedId: vendorProfile.id,
            link: "/admin/vendors"
          });
        }
      }
      
      res.status(201).json(vendorProfile);
    } catch (error) {
      console.error("Create vendor profile error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create vendor profile" });
    }
  });
  
  // Update vendor profile
  app.patch("/api/vendors/:id", authenticateToken, authorizeRoles([UserRole.VENDOR, UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const vendorProfile = await storage.getVendorProfile(vendorId);
      
      if (!vendorProfile) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      // Ensure only the vendor or admin can update the profile
      if (vendorProfile.userId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Not authorized to update this vendor profile" });
      }
      
      // Prevent changing specific fields for non-admin users
      if (req.user.role !== UserRole.ADMIN) {
        delete req.body.featured;
        delete req.body.verificationStatus;
        delete req.body.reviewCount;
      }
      
      const updatedProfile = await storage.updateVendorProfile(vendorId, req.body);
      
      if (!updatedProfile) {
        return res.status(500).json({ message: "Failed to update vendor profile" });
      }
      
      // If this is the first time the vendor completes their profile, create a notification
      if (!vendorProfile.profileComplete && req.body.profileComplete) {
        // Notify supervisors
        const supervisors = await storage.getUsersByRole(UserRole.SUPERVISOR);
        if (supervisors && supervisors.length > 0) {
          for (const supervisor of supervisors) {
            await storage.createNotification({
              userId: supervisor.id,
              title: "New Vendor Profile Completed",
              content: `${updatedProfile.businessName} has completed their vendor profile.`,
              type: "vendor",
              isRead: false,
              relatedId: vendorProfile.id,
              link: `/supervisor/vendors/${vendorProfile.id}`
            });
          }
        }
      }
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Update vendor profile error:", error);
      res.status(500).json({ message: "Failed to update vendor profile" });
    }
  });
  
  // Get vendor reviews
  app.get("/api/vendors/:id/reviews", async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const reviews = await storage.getVendorReviewsByVendorId(vendorId);
      res.json(reviews);
    } catch (error) {
      console.error("Get vendor reviews error:", error);
      res.status(500).json({ message: "Failed to retrieve vendor reviews" });
    }
  });
  
  // Create vendor review
  app.post("/api/vendors/:id/reviews", authenticateToken, authorizeRoles([UserRole.BRIDE, UserRole.GROOM, UserRole.FAMILY]), async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if vendor exists
      const vendor = await storage.getVendorProfile(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Check if user has a booking with this vendor
      const bookings = await storage.getVendorBookingsByUserId(userId);
      const hasBooking = bookings.some(booking => 
        booking.vendorId === vendorId && 
        ['confirmed', 'completed'].includes(booking.status)
      );
      
      // Only allow reviews if the user has a confirmed/completed booking with this vendor
      // Unless they're an admin (for testing)
      if (!hasBooking && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ 
          message: "You can only review vendors you have booked and confirmed/completed" 
        });
      }
      
      // If user has already reviewed this vendor, don't allow another review
      const existingReviews = await storage.getVendorReviewsByVendorId(vendorId);
      const alreadyReviewed = existingReviews.some(review => review.userId === userId);
      
      if (alreadyReviewed) {
        return res.status(400).json({ message: "You have already reviewed this vendor" });
      }
      
      const validatedData = insertVendorReviewSchema.parse({
        ...req.body,
        vendorId,
        userId,
        verified: hasBooking, // Mark as verified if they have a booking
      });
      
      const review = await storage.createVendorReview(validatedData);
      
      // Update vendor rating and review count
      let totalRating = 0;
      let reviewCount = existingReviews.length + 1;
      
      existingReviews.forEach(r => {
        totalRating += r.rating;
      });
      totalRating += review.rating;
      
      const averageRating = Math.round(totalRating / reviewCount);
      
      await storage.updateVendorProfile(vendorId, {
        rating: averageRating,
        reviewCount
      });
      
      // Notify vendor about the new review
      const vendorUser = await storage.getUser(vendor.userId);
      if (vendorUser) {
        await storage.createNotification({
          userId: vendorUser.id,
          title: "New Review Received",
          content: `You've received a ${review.rating}-star review from a client.`,
          type: "vendor",
          isRead: false,
          relatedId: review.id,
          link: "/vendor/reviews"
        });
      }
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Create vendor review error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create vendor review" });
    }
  });

  // Vendor Calendar routes
  // Get vendor calendar entries
  app.get("/api/vendors/:id/calendar", async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const calendar = await storage.getVendorCalendarByVendorId(vendorId);
      res.json(calendar);
    } catch (error) {
      console.error("Get vendor calendar error:", error);
      res.status(500).json({ message: "Failed to retrieve vendor calendar" });
    }
  });

  // Get vendor calendar by date range
  app.get("/api/vendors/:id/calendar/range", async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const calendar = await storage.getVendorCalendarByDateRange(
        vendorId, 
        new Date(startDate as string), 
        new Date(endDate as string)
      );
      res.json(calendar);
    } catch (error) {
      console.error("Get vendor calendar by date range error:", error);
      res.status(500).json({ message: "Failed to retrieve vendor calendar" });
    }
  });

  // Get calendar entry by ID
  app.get("/api/vendor-calendar/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const calendarId = parseInt(req.params.id);
      const calendar = await storage.getVendorCalendarById(calendarId);
      
      if (!calendar) {
        return res.status(404).json({ message: "Calendar entry not found" });
      }
      
      // Check if the user is the vendor who owns this calendar or an admin
      if (req.user.id !== calendar.vendorId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to view this calendar entry" });
      }
      
      res.json(calendar);
    } catch (error) {
      console.error("Get vendor calendar entry error:", error);
      res.status(500).json({ message: "Failed to retrieve vendor calendar entry" });
    }
  });

  // Create calendar entry
  app.post("/api/vendor-calendar", authenticateToken, authorizeRoles([UserRole.VENDOR]), async (req: Request, res: Response) => {
    try {
      const vendorId = req.user.id;
      
      // Validate request data
      const validatedData = insertVendorCalendarSchema.parse({
        ...req.body,
        vendorId: vendorId,
      });
      
      // Check if calendar entry already exists for this date
      const existingEntry = await storage.getVendorCalendarByDate(vendorId, new Date(validatedData.date));
      
      if (existingEntry) {
        return res.status(400).json({ message: "Calendar entry already exists for this date" });
      }
      
      const calendar = await storage.createVendorCalendar(validatedData);
      res.status(201).json(calendar);
    } catch (error) {
      console.error("Create vendor calendar error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create vendor calendar entry" });
    }
  });

  // Update calendar entry
  app.patch("/api/vendor-calendar/:id", authenticateToken, authorizeRoles([UserRole.VENDOR, UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const calendarId = parseInt(req.params.id);
      
      // Check if calendar entry exists
      const calendar = await storage.getVendorCalendarById(calendarId);
      if (!calendar) {
        return res.status(404).json({ message: "Calendar entry not found" });
      }
      
      // Check if the user is the vendor who owns this calendar or an admin
      if (req.user.id !== calendar.vendorId && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Not authorized to update this calendar entry" });
      }
      
      const updatedCalendar = await storage.updateVendorCalendar(calendarId, req.body);
      res.json(updatedCalendar);
    } catch (error) {
      console.error("Update vendor calendar error:", error);
      res.status(500).json({ message: "Failed to update vendor calendar entry" });
    }
  });

  // Delete calendar entry
  app.delete("/api/vendor-calendar/:id", authenticateToken, authorizeRoles([UserRole.VENDOR, UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const calendarId = parseInt(req.params.id);
      
      // Check if calendar entry exists
      const calendar = await storage.getVendorCalendarById(calendarId);
      if (!calendar) {
        return res.status(404).json({ message: "Calendar entry not found" });
      }
      
      // Check if the user is the vendor who owns this calendar or an admin
      if (req.user.id !== calendar.vendorId && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Not authorized to delete this calendar entry" });
      }
      
      await storage.deleteVendorCalendar(calendarId);
      res.json({ message: "Calendar entry deleted successfully" });
    } catch (error) {
      console.error("Delete vendor calendar error:", error);
      res.status(500).json({ message: "Failed to delete vendor calendar entry" });
    }
  });

  // Update calendar availability for a specific date
  app.patch("/api/vendors/:id/calendar/availability", authenticateToken, async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const { date, status, timeSlots } = req.body;
      
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }
      
      if (!status && !timeSlots) {
        return res.status(400).json({ message: "Either status or timeSlots must be provided" });
      }
      
      // Check if the user is the vendor or an admin
      if (req.user.id !== vendorId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to update this vendor's calendar" });
      }
      
      // Check if calendar entry exists for this date
      let calendar = await storage.getVendorCalendarByDate(vendorId, new Date(date));
      
      // If not exists, create a new one
      if (!calendar) {
        calendar = await storage.createVendorCalendar({
          vendorId,
          date,
          timeSlots: timeSlots || null,
          isFullDayEvent: !!status,
          fullDayStatus: status || null,
        });
      } else {
        // Update existing calendar entry
        calendar = await storage.updateVendorCalendar(calendar.id, {
          timeSlots: timeSlots || calendar.timeSlots,
          isFullDayEvent: status ? true : calendar.isFullDayEvent,
          fullDayStatus: status || calendar.fullDayStatus,
        });
      }
      
      res.json(calendar);
    } catch (error) {
      console.error("Update vendor calendar availability error:", error);
      res.status(500).json({ message: "Failed to update vendor calendar availability" });
    }
  });

  // Vendor Analytics API routes
  // Get vendor analytics
  app.get("/api/vendors/:id/analytics", authenticateToken, async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      
      // Get vendor profile
      const vendorProfile = await storage.getVendorProfileByUserId(vendorId);
      if (!vendorProfile) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      // Check if the user is the vendor or an admin/supervisor
      if (req.user.id !== vendorId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to view these analytics" });
      }
      
      // Get analytics
      const analytics = await storage.getVendorAnalyticsByVendorId(vendorProfile.id);
      
      // If no analytics exist yet, calculate them
      if (!analytics) {
        const newAnalytics = await storage.calculateVendorAnalytics(vendorId);
        return res.json(newAnalytics);
      }
      
      res.json(analytics);
    } catch (error) {
      console.error("Get vendor analytics error:", error);
      res.status(500).json({ message: "Failed to retrieve vendor analytics" });
    }
  });
  
  // Generate/refresh vendor analytics
  app.post("/api/vendors/:id/analytics/calculate", authenticateToken, async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      
      // Check if the user is the vendor or an admin/supervisor
      if (req.user.id !== vendorId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to calculate these analytics" });
      }
      
      // Calculate analytics
      const analytics = await storage.calculateVendorAnalytics(vendorId);
      res.json(analytics);
    } catch (error) {
      console.error("Calculate vendor analytics error:", error);
      res.status(500).json({ message: "Failed to calculate vendor analytics" });
    }
  });
  
  // Calculate and get SQS score for a vendor
  app.get("/api/vendors/:id/sqs", authenticateToken, async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      
      // Check if the user is the vendor or an admin/supervisor
      if (!req.user || (req.user.id !== vendorId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR)) {
        return res.status(403).json({ message: "Not authorized to view SQS score" });
      }
      
      // Calculate SQS score
      const sqsResult = await storage.calculateSQSScore(vendorId);
      res.json(sqsResult);
    } catch (error: any) {
      console.error("Calculate SQS score error:", error);
      res.status(500).json({ message: "Failed to calculate SQS score" });
    }
  });
  
  // Update specific vendor analytics data (for manual updates)
  app.patch("/api/vendors/:id/analytics", authenticateToken, authorizeRoles([UserRole.ADMIN, UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      
      // Get vendor profile
      const vendorProfile = await storage.getVendorProfileByUserId(vendorId);
      if (!vendorProfile) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      // Get analytics
      const analytics = await storage.getVendorAnalyticsByVendorId(vendorProfile.id);
      if (!analytics) {
        return res.status(404).json({ message: "Analytics not found for this vendor" });
      }
      
      // Update analytics
      const updatedAnalytics = await storage.updateVendorAnalytics(analytics.id, req.body);
      res.json(updatedAnalytics);
    } catch (error) {
      console.error("Update vendor analytics error:", error);
      res.status(500).json({ message: "Failed to update vendor analytics" });
    }
  });

  // Vendor booking routes
  app.get("/api/bookings", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // If user is a vendor, get bookings for this vendor
      if (req.user.role === UserRole.VENDOR) {
        const vendorProfile = await storage.getVendorProfileByUserId(userId);
        
        if (!vendorProfile) {
          return res.status(404).json({ message: "Vendor profile not found" });
        }
        
        const bookings = await storage.getVendorBookingsByVendorId(vendorProfile.id);
        return res.json(bookings);
      }
      
      // For other users, get their own bookings
      const bookings = await storage.getVendorBookingsByUserId(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Failed to retrieve bookings" });
    }
  });

  app.post("/api/bookings", authenticateToken, async (req: Request, res: Response) => {
    try {
      const validatedData = insertVendorBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const booking = await storage.createVendorBooking(validatedData);
      
      // Send booking confirmation email
      const user = await storage.getUser(req.user.id);
      const vendorProfile = await storage.getVendorProfile(booking.vendorId);
      
      if (user && vendorProfile) {
        const vendor = await storage.getUser(vendorProfile.userId);
        
        if (vendor) {
          await sendBookingConfirmationEmail(
            user.name,
            user.email,
            vendorProfile.businessName,
            vendorProfile.vendorType,
            booking.eventDate
          );
        }
      }
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if booking exists
      const booking = await storage.getVendorBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user is authorized to update this booking
      const vendorProfile = await storage.getVendorProfileByUserId(userId);
      if (
        booking.userId !== userId && 
        (!vendorProfile || booking.vendorId !== vendorProfile.id) && 
        req.user.role !== UserRole.ADMIN && 
        req.user.role !== UserRole.SUPERVISOR
      ) {
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }
      
      const updatedBooking = await storage.updateVendorBooking(bookingId, req.body);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Update booking error:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // User routes
  app.get("/api/users/me", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data (excluding password)
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to retrieve user" });
    }
  });

  app.patch("/api/users/me", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Don't allow updating role or password through this endpoint
      const { role, password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return updated user data (excluding password)
      const { password: _, ...userData } = updatedUser;
      res.json(userData);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Filter users by role if specified
      const { role } = req.query;
      if (role) {
        const filteredUsers = users.filter(user => user.role === role);
        
        // Exclude passwords from user data
        const userData = filteredUsers.map(({ password, ...user }) => user);
        return res.json(userData);
      }
      
      // Exclude passwords from user data
      const userData = users.map(({ password, ...user }) => user);
      res.json(userData);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to retrieve users" });
    }
  });

  app.get("/api/admin/users/:id", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data (excluding password)
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to retrieve user" });
    }
  });

  app.patch("/api/admin/users/:id", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get existing user first to log changes
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow updating password through this endpoint
      const { password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If supervisor was assigned, send notification emails
      if (updateData.supervisorId && updateData.supervisorId !== existingUser.supervisorId) {
        const supervisor = await storage.getUser(updateData.supervisorId);
        
        if (supervisor) {
          // Send email to user
          await sendSupervisorAllocationEmail(
            updatedUser.name,
            updatedUser.email,
            supervisor.name,
            supervisor.email,
            "Not provided", // Phone number not stored in this implementation
            updatedUser.weddingDate || "Not set yet"
          );
          
          // Send email to supervisor
          await sendSupervisorNotificationEmail(
            updatedUser.name,
            updatedUser.email,
            "Not provided", // Phone number not stored in this implementation
            supervisor.name,
            supervisor.email,
            updatedUser.weddingDate || "Not set yet",
            updatedUser.package || "Not selected"
          );
          
          // Record supervisor assignment in admin action logs
          await storage.createAdminActionLog({
            adminId: req.user!.id,
            action: "ASSIGN_SUPERVISOR",
            userId: userId,
            details: { 
              userId: userId, 
              email: updatedUser.email, 
              supervisorId: updateData.supervisorId,
              supervisorName: supervisor.name,
              supervisorEmail: supervisor.email
            },
            timestamp: new Date()
          });
        }
      } 
      
      // Record admin action for user update
      await storage.createAdminActionLog({
        adminId: req.user!.id,
        action: "UPDATE_USER",
        userId: userId,
        details: { 
          userId: userId, 
          email: updatedUser.email,
          role: updatedUser.role,
          changes: updateData
        },
        timestamp: new Date()
      });
      
      // Return updated user data (excluding password)
      const { password: _, ...userData } = updatedUser;
      res.json(userData);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Create a new user (especially for Supervisor/Admin roles)
  app.post("/api/admin/users/create", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const { name, email, role, password, location } = req.body;
      
      // Validate required fields
      if (!name || !email || !role) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Generate password if not provided
      const finalPassword = password || Math.random().toString(36).slice(-8);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash password before storing
      const hashedPassword = await hashPassword(finalPassword);
      
      // Generate unique ID for supervisors (format: S#0001)
      let uniqueId = null;
      if (role === UserRole.SUPERVISOR) {
        // Get current count of supervisors to determine next ID
        const supervisors = await storage.getUsersByRole(UserRole.SUPERVISOR);
        const count = supervisors.length + 1;
        uniqueId = `S#${count.toString().padStart(4, '0')}`;
        
        // Simulate sending welcome email with credentials
        console.log(`[EMAIL SIMULATION] New supervisor account created: 
          To: ${email}
          Subject: Your Sehra Supervisor Account
          Body: Welcome to Sehra, ${name}! Your account has been created with ID: ${uniqueId}. 
          Your temporary password is: ${finalPassword}. Please change it after first login.`);
      }
      
      // Create new user
      const newUser = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role,
        location,
        uniqueId,
        lastActive: new Date(),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Record admin action
      await storage.createAdminActionLog({
        adminId: req.user!.id,
        action: "CREATE_USER",
        details: { userId: newUser.id, role, email },
        timestamp: new Date()
      });
      
      // Remove password from response
      const { password: _, ...userResponse } = newUser;
      
      res.status(201).json({ ...userResponse, generatedPassword: role === UserRole.SUPERVISOR ? finalPassword : undefined });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user", error: error.message });
    }
  });
  
  // Update a user (edit name, email, role, status, location)
  app.patch("/api/admin/users/:id/password", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { password, sendResetEmail } = req.body;
      
      // Get existing user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If sending reset email is requested
      if (sendResetEmail) {
        // Generate random password
        const tempPassword = Math.random().toString(36).slice(-8);
        
        // Hash password
        const hashedPassword = await hashPassword(tempPassword);
        
        // Update user with new password
        await storage.updateUser(userId, {
          password: hashedPassword,
          updatedAt: new Date()
        });
        
        // Record admin action
        await storage.createAdminActionLog({
          adminId: req.user!.id,
          action: "RESET_PASSWORD",
          details: { userId, email: user.email },
          timestamp: new Date()
        });
        
        // Simulate sending email
        console.log(`[EMAIL SIMULATION] Password reset: 
          To: ${user.email}
          Subject: Your Sehra Password Has Been Reset
          Body: Hello ${user.name}, your password has been reset. Your new temporary password is: ${tempPassword}. 
          Please change it after logging in.`);
        
        res.json({ message: "Password reset email sent", newPassword: tempPassword });
        return;
      }
      
      // Otherwise update with provided password
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      const hashedPassword = await hashPassword(password);
      
      await storage.updateUser(userId, {
        password: hashedPassword,
        updatedAt: new Date()
      });
      
      // Record admin action
      await storage.createAdminActionLog({
        adminId: req.user!.id,
        action: "CHANGE_PASSWORD",
        details: { userId, email: user.email },
        timestamp: new Date()
      });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ message: "Failed to update password", error: error.message });
    }
  });
  
  // Delete a user
  app.delete("/api/admin/users/:id", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get existing user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow deleting themselves
      if (req.user?.id === userId) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      // If user is a supervisor, handle their client reassignments
      if (user.role === UserRole.SUPERVISOR) {
        // Get all clients assigned to this supervisor
        const clients = await storage.getClientsBySupervisorId(userId);
        
        // Unassign all clients (set supervisorId to null)
        for (const client of clients) {
          await storage.updateUser(client.id, { supervisorId: null });
        }
      }
      
      // Soft delete or delete the user
      await storage.deleteUser(userId);
      
      // Record admin action
      await storage.createAdminActionLog({
        adminId: req.user!.id,
        action: "DELETE_USER",
        details: { userId, email: user.email, role: user.role },
        timestamp: new Date()
      });
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
  });
  
  // Admin analytics endpoints
  app.get("/api/admin/all-tasks", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching all tasks:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/admin/all-guests", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const guests = await storage.getAllGuests();
      res.json(guests);
    } catch (error) {
      console.error("Error fetching all guests:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/admin/all-budget-items", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const budgetItems = await storage.getAllBudgetItems();
      res.json(budgetItems);
    } catch (error) {
      console.error("Error fetching all budget items:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/admin/all-bookings", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getAllVendorBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Supervisor routes
  app.get("/api/supervisor/clients", authenticateToken, authorizeRoles([UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const supervisorId = req.user.id;
      const clients = await storage.getUsersBySupervisorId(supervisorId);
      
      // Exclude passwords from user data
      const clientData = clients.map(({ password, ...client }) => client);
      res.json(clientData);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Failed to retrieve clients" });
    }
  });
  
  // Route for supervisor to assign vendors to clients
  app.post("/api/supervisor/assign-vendors", authenticateToken, authorizeRoles([UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const { clientId, vendorIds } = req.body;
      
      if (!clientId || !vendorIds || !Array.isArray(vendorIds)) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      // Get the client
      const client = await storage.getUser(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if the client is assigned to this supervisor
      if (client.supervisorId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to assign vendors to this client" });
      }
      
      // Update client with assigned vendors
      const updatedClient = await storage.updateUser(clientId, {
        assignedVendors: vendorIds
      });
      
      if (!updatedClient) {
        return res.status(500).json({ message: "Failed to assign vendors" });
      }
      
      // Return updated client data (excluding password)
      const { password, ...clientData } = updatedClient;
      res.json(clientData);
    } catch (error) {
      console.error("Assign vendors error:", error);
      res.status(500).json({ message: "Failed to assign vendors" });
    }
  });
  
  // Route for supervisor to get assigned vendors for a client
  app.get("/api/supervisor/assigned-vendors/:clientId", authenticateToken, authorizeRoles([UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      
      // Get the client
      const client = await storage.getUser(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if the client is assigned to this supervisor
      if (client.supervisorId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view assigned vendors for this client" });
      }
      
      // Get vendor details
      let vendorDetails = [];
      if (client.assignedVendors && Array.isArray(client.assignedVendors)) {
        // Get each vendor profile
        const vendorPromises = client.assignedVendors.map(async (vendorId) => {
          const vendor = await storage.getUser(vendorId);
          if (!vendor) return null;
          
          const vendorProfile = await storage.getVendorProfileByUserId(vendorId);
          return {
            id: vendor.id,
            name: vendor.name,
            email: vendor.email,
            uniqueId: vendor.uniqueId,
            profile: vendorProfile || null
          };
        });
        
        vendorDetails = (await Promise.all(vendorPromises)).filter(v => v !== null);
      }
      
      res.json(vendorDetails);
    } catch (error) {
      console.error("Get assigned vendors error:", error);
      res.status(500).json({ message: "Failed to retrieve assigned vendors" });
    }
  });
  
  // Route for clients to get their assigned vendors
  app.get("/api/client/assigned-vendors", authenticateToken, authorizeRoles([UserRole.BRIDE, UserRole.GROOM, UserRole.FAMILY]), async (req: Request, res: Response) => {
    try {
      const clientId = req.user.id;
      
      // Get the client
      const client = await storage.getUser(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Get vendor details
      let vendorDetails = [];
      if (client.assignedVendors && Array.isArray(client.assignedVendors)) {
        // Get each vendor profile
        const vendorPromises = client.assignedVendors.map(async (vendorId) => {
          const vendor = await storage.getUser(vendorId);
          if (!vendor) return null;
          
          const vendorProfile = await storage.getVendorProfileByUserId(vendorId);
          return {
            id: vendor.id,
            name: vendor.name,
            email: vendor.email,
            uniqueId: vendor.uniqueId,
            profile: vendorProfile || null
          };
        });
        
        vendorDetails = (await Promise.all(vendorPromises)).filter(v => v !== null);
      }
      
      res.json(vendorDetails);
    } catch (error) {
      console.error("Get assigned vendors error:", error);
      res.status(500).json({ message: "Failed to retrieve assigned vendors" });
    }
  });

  // Wedding date routes
  app.patch("/api/wedding-date", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { weddingDate } = req.body;
      
      if (!weddingDate) {
        return res.status(400).json({ message: "Wedding date is required" });
      }
      
      const updatedUser = await storage.updateUser(userId, { weddingDate });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return updated user data (excluding password)
      const { password, ...userData } = updatedUser;
      res.json(userData);
    } catch (error) {
      console.error("Update wedding date error:", error);
      res.status(500).json({ message: "Failed to update wedding date" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req: Request, res: Response) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ message: "Failed to retrieve achievements" });
    }
  });

  app.get("/api/achievements/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const achievements = await storage.getAchievementsByCategory(category);
      res.json(achievements);
    } catch (error) {
      console.error("Get achievements by category error:", error);
      res.status(500).json({ message: "Failed to retrieve achievements by category" });
    }
  });

  app.get("/api/achievements/:id", async (req: Request, res: Response) => {
    try {
      const achievementId = parseInt(req.params.id);
      const achievement = await storage.getAchievement(achievementId);
      
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      res.json(achievement);
    } catch (error) {
      console.error("Get achievement error:", error);
      res.status(500).json({ message: "Failed to retrieve achievement" });
    }
  });

  app.post("/api/achievements", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const validatedData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(validatedData);
      res.status(201).json(achievement);
    } catch (error) {
      console.error("Create achievement error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create achievement" });
    }
  });

  app.patch("/api/achievements/:id", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const achievementId = parseInt(req.params.id);
      const achievement = await storage.getAchievement(achievementId);
      
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      const updatedAchievement = await storage.updateAchievement(achievementId, req.body);
      res.json(updatedAchievement);
    } catch (error) {
      console.error("Update achievement error:", error);
      res.status(500).json({ message: "Failed to update achievement" });
    }
  });

  app.delete("/api/achievements/:id", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const achievementId = parseInt(req.params.id);
      const achievement = await storage.getAchievement(achievementId);
      
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      await storage.deleteAchievement(achievementId);
      res.json({ message: "Achievement deleted successfully" });
    } catch (error) {
      console.error("Delete achievement error:", error);
      res.status(500).json({ message: "Failed to delete achievement" });
    }
  });

  // User Achievement routes
  app.get("/api/user-achievements", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const userAchievements = await storage.getUserAchievementsByUserId(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Get user achievements error:", error);
      res.status(500).json({ message: "Failed to retrieve user achievements" });
    }
  });

  app.post("/api/user-achievements", authenticateToken, async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserAchievementSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const userAchievement = await storage.createUserAchievement(validatedData);
      res.status(201).json(userAchievement);
    } catch (error) {
      console.error("Create user achievement error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create user achievement" });
    }
  });

  app.patch("/api/user-achievements/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const achievementId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user achievement exists and belongs to user
      const userAchievement = await storage.getUserAchievement(achievementId);
      if (!userAchievement) {
        return res.status(404).json({ message: "User achievement not found" });
      }
      
      if (userAchievement.userId !== userId && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Not authorized to update this user achievement" });
      }
      
      const updatedUserAchievement = await storage.updateUserAchievement(achievementId, req.body);
      res.json(updatedUserAchievement);
    } catch (error) {
      console.error("Update user achievement error:", error);
      res.status(500).json({ message: "Failed to update user achievement" });
    }
  });

  // User Progress routes
  app.get("/api/user-progress", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const userProgress = await storage.getUserProgressByUserId(userId);
      
      if (!userProgress) {
        // If no progress record exists yet, create one
        const newUserProgress = await storage.createUserProgress({
          userId,
          totalPoints: 0,
          level: 1,
          tasksCompleted: 0,
          checklistProgress: 0,
          budgetHealth: 100,
          budgetMood: 'neutral',
          streak: 0
        });
        return res.json(newUserProgress);
      }
      
      res.json(userProgress);
    } catch (error) {
      console.error("Get user progress error:", error);
      res.status(500).json({ message: "Failed to retrieve user progress" });
    }
  });
  
  app.patch("/api/user-progress", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Check if user progress exists
      let userProgress = await storage.getUserProgressByUserId(userId);
      
      if (!userProgress) {
        // If no progress record exists yet, create one with the provided data
        userProgress = await storage.createUserProgress({
          userId,
          ...req.body
        });
      } else {
        // Update existing progress
        userProgress = await storage.updateUserProgress(userProgress.id, {
          ...req.body,
          lastActive: new Date().toISOString() // Always update last active timestamp
        });
      }
      
      res.json(userProgress);
    } catch (error) {
      console.error("Update user progress error:", error);
      res.status(500).json({ message: "Failed to update user progress" });
    }
  });

  // Timeline Event routes
  app.get("/api/timeline-events", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const timelineEvents = await storage.getTimelineEventsByUserId(userId);
      res.json(timelineEvents);
    } catch (error) {
      console.error("Get timeline events error:", error);
      res.status(500).json({ message: "Failed to retrieve timeline events" });
    }
  });

  app.post("/api/timeline-events", authenticateToken, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTimelineEventSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const timelineEvent = await storage.createTimelineEvent(validatedData);
      res.status(201).json(timelineEvent);
    } catch (error) {
      console.error("Create timeline event error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create timeline event" });
    }
  });

  app.patch("/api/timeline-events/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if timeline event exists and belongs to user
      const timelineEvent = await storage.getTimelineEvent(eventId);
      if (!timelineEvent) {
        return res.status(404).json({ message: "Timeline event not found" });
      }
      
      if (timelineEvent.userId !== userId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to update this timeline event" });
      }
      
      const updatedTimelineEvent = await storage.updateTimelineEvent(eventId, req.body);
      res.json(updatedTimelineEvent);
    } catch (error) {
      console.error("Update timeline event error:", error);
      res.status(500).json({ message: "Failed to update timeline event" });
    }
  });

  app.delete("/api/timeline-events/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if timeline event exists and belongs to user
      const timelineEvent = await storage.getTimelineEvent(eventId);
      if (!timelineEvent) {
        return res.status(404).json({ message: "Timeline event not found" });
      }
      
      if (timelineEvent.userId !== userId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERVISOR) {
        return res.status(403).json({ message: "Not authorized to delete this timeline event" });
      }
      
      await storage.deleteTimelineEvent(eventId);
      res.json({ message: "Timeline event deleted successfully" });
    } catch (error) {
      console.error("Delete timeline event error:", error);
      res.status(500).json({ message: "Failed to delete timeline event" });
    }
  });

  app.post("/api/timeline-events/reorder", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { eventIds } = req.body;
      
      if (!Array.isArray(eventIds)) {
        return res.status(400).json({ message: "Event IDs must be an array" });
      }
      
      const reorderedEvents = await storage.reorderTimelineEvents(userId, eventIds);
      res.json(reorderedEvents);
    } catch (error) {
      console.error("Reorder timeline events error:", error);
      res.status(500).json({ message: "Failed to reorder timeline events" });
    }
  });

  // Package and payment routes
  // Endpoint to fetch user's current package
  app.get("/api/users/package", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        package: user.package || 'SILVER'
      });
    } catch (error) {
      console.error("Get user package error:", error);
      res.status(500).json({ message: "Failed to get user package" });
    }
  });

  // Initialize Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Endpoint to create a payment intent for package upgrade
  app.post("/api/payment/create-intent", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { packageType } = req.body;
      const userId = req.user.id;

      if (!packageType) {
        return res.status(400).json({ message: "Package type is required" });
      }

      // Determine amount based on package type
      let amount = 0;
      if (packageType === 'GOLD') {
        amount = 999;
      } else if (packageType === 'PLATINUM') {
        amount = 2999;
      }

      // For free tier, no payment intent needed
      if (amount === 0) {
        return res.json({ 
          clientSecret: 'free_tier',
          amount: 0 
        });
      }

      // Create a real payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'inr',
        metadata: {
          userId: userId.toString(),
          packageType
        },
        payment_method_types: ['card']
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        amount
      });
    } catch (error) {
      console.error("Create payment intent error:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Endpoint to confirm payment and upgrade package
  app.post("/api/payment/confirm", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { packageType, paymentMethod } = req.body;
      const userId = req.user.id;

      if (!packageType) {
        return res.status(400).json({ message: "Package type is required" });
      }

      // Determine amount based on package type
      let amount = 0;
      if (packageType === 'GOLD') {
        amount = 999;
      } else if (packageType === 'PLATINUM') {
        amount = 2999;
      }

      // For free tier, just update user package
      if (amount === 0) {
        await storage.updateUser(userId, { package: packageType });
        return res.json({ 
          success: true,
          message: "Package upgraded successfully",
          package: packageType
        });
      }

      // Process payment using Stripe
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Stripe uses cents
        currency: 'inr',
        payment_method_types: ['card'],
        metadata: {
          userId: userId.toString(),
          packageType
        }
      });

      // Update user package in database
      await storage.updateUser(userId, { 
        package: packageType
      });
      
      const paymentResult = {
        id: paymentIntent.id,
        amount,
        status: paymentIntent.status
      };

      res.json({
        success: true,
        message: "Payment processed and package upgraded successfully",
        package: packageType,
        paymentResult
      });
    } catch (error) {
      console.error("Confirm payment error:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  // Endpoint to update user package (for testing or admin operations)
  app.patch("/api/users/package", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { package: packageType } = req.body;
      const userId = req.user.id;

      if (!packageType || !['SILVER', 'GOLD', 'PLATINUM'].includes(packageType)) {
        return res.status(400).json({ message: "Valid package type is required" });
      }

      // Update user package
      const updatedUser = await storage.updateUser(userId, { package: packageType });

      res.json({
        success: true,
        message: "Package updated successfully",
        user: {
          id: updatedUser?.id,
          package: updatedUser?.package || packageType
        }
      });
    } catch (error) {
      console.error("Update user package error:", error);
      res.status(500).json({ message: "Failed to update user package" });
    }
  });

  // Socket.io event handlers
  io.on("connection", async (socket) => {
    console.log("Client connected to Socket.IO:", socket.id);
    
    // Authenticate socket connection
    socket.on("authenticate", async (token) => {
      try {
        const userData = await storage.getUserByEmail(token.email);
        if (!userData) {
          socket.emit("authentication_error", "Invalid user");
          return;
        }
        
        // Store user info in socket
        socket.data.user = userData;
        socket.join(`user-${userData.id}`); // Join user-specific room
        
        // If supervisor, join supervisor room
        if (userData.role === UserRole.SUPERVISOR) {
          socket.join("supervisors");
          console.log(`Supervisor ${userData.name} (${userData.id}) joined supervisors room`);
        }
        
        // If client, join client room and supervisor-specific room if assigned
        if ([UserRole.BRIDE, UserRole.GROOM, UserRole.FAMILY].includes(userData.role as any)) {
          socket.join("clients");
          
          // If client has assigned supervisor, join that room too
          if (userData.supervisorId) {
            socket.join(`supervisor-${userData.supervisorId}`);
            console.log(`Client ${userData.name} (${userData.id}) joined supervisor-${userData.supervisorId} room`);
          }
        }
        
        socket.emit("authenticated", { success: true });
        console.log(`User authenticated: ${userData.name} (${userData.role})`);
      } catch (error) {
        console.error("Socket authentication error:", error);
        socket.emit("authentication_error", "Authentication failed");
      }
    });
    
    // Handle private messages between supervisor and client
    socket.on("send_message", async (data) => {
      try {
        const { toUserId, message, type = "text" } = data;
        const fromUser = socket.data.user;
        
        if (!fromUser) {
          socket.emit("error", "Not authenticated");
          return;
        }
        
        // Create and save the message
        const newMessage = await storage.createMessage({
          fromUserId: fromUser.id,
          toUserId,
          content: message,
          messageType: type,
          read: false,
          createdAt: new Date()
        });
        
        // Emit to recipient
        io.to(`user-${toUserId}`).emit("receive_message", {
          ...newMessage,
          senderName: fromUser.name,
        });
        
        // Confirm to sender
        socket.emit("message_sent", { success: true, messageId: newMessage.id });
        
        // Update contact status
        await updateContactStatusAfterMessage(fromUser.id, toUserId);
      } catch (error) {
        console.error("Message sending error:", error);
        socket.emit("error", "Failed to send message");
      }
    });
    
    // Mark messages as read
    socket.on("mark_messages_read", async (data) => {
      try {
        const { fromUserId } = data;
        const currentUser = socket.data.user;
        
        if (!currentUser) {
          socket.emit("error", "Not authenticated");
          return;
        }
        
        await storage.markAllMessagesAsRead(fromUserId, currentUser.id);
        socket.emit("messages_marked_read", { success: true });
        
        // Notify the other user that their messages were read
        io.to(`user-${fromUserId}`).emit("message_status_update", {
          toUserId: currentUser.id,
          read: true
        });
      } catch (error) {
        console.error("Mark messages read error:", error);
        socket.emit("error", "Failed to mark messages as read");
      }
    });
    
    // Supervisor allocation notification
    socket.on("supervisor_allocated", async (data) => {
      try {
        const { clientId, supervisorId } = data;
        const currentUser = socket.data.user;
        
        if (!currentUser || currentUser.role !== UserRole.ADMIN) {
          socket.emit("error", "Not authorized");
          return;
        }
        
        const client = await storage.getUser(clientId);
        const supervisor = await storage.getUser(supervisorId);
        
        if (!client || !supervisor) {
          socket.emit("error", "Invalid client or supervisor ID");
          return;
        }
        
        // Notify the client about their supervisor assignment
        io.to(`user-${clientId}`).emit("supervisor_assigned", {
          supervisorId,
          supervisorName: supervisor.name,
          supervisorEmail: supervisor.email
        });
        
        // Notify the supervisor about their new client
        io.to(`user-${supervisorId}`).emit("client_assigned", {
          clientId,
          clientName: client.name,
          clientEmail: client.email,
          package: client.package
        });
        
        // Create/update contact status record
        await storage.createContactStatus({
          userId: clientId,
          supervisorId,
          status: "assigned",
          lastUpdated: new Date(),
          lastContactDate: new Date()
        });
        
        socket.emit("allocation_success", { success: true });
      } catch (error) {
        console.error("Supervisor allocation error:", error);
        socket.emit("error", "Failed to process supervisor allocation");
      }
    });
    
    // Handle disconnection
    socket.on("disconnect", () => {
      const user = socket.data.user;
      if (user) {
        console.log(`User disconnected: ${user.name} (${user.role})`);
      } else {
        console.log("Client disconnected:", socket.id);
      }
    });
  });
  
  // Client gets supervisor information
  app.get("/api/client/supervisors", authenticateToken, authorizeRoles([UserRole.BRIDE, UserRole.GROOM, UserRole.FAMILY]), async (req: Request, res: Response) => {
    try {
      const user = req.user;
      
      // If user has an assigned supervisor, return just that supervisor
      if (user.supervisorId) {
        const supervisor = await storage.getUser(user.supervisorId);
        if (supervisor) {
          const { password, ...supervisorData } = supervisor;
          return res.json([supervisorData]);
        }
      }
      
      // Otherwise, return all supervisors (usually there would just be one assigned)
      const supervisors = await storage.getUsersByRole(UserRole.SUPERVISOR);
      const sanitizedSupervisors = supervisors.map(s => {
        const { password, ...supervisorData } = s;
        return supervisorData;
      });
      
      res.json(sanitizedSupervisors);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      res.status(500).json({ message: "Failed to fetch supervisors" });
    }
  });
  
  // Supervisor gets assigned clients
  app.get("/api/supervisor/clients", authenticateToken, authorizeRoles([UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const supervisorId = req.user.id;
      
      // Get all clients that have this supervisor assigned
      const clients = await storage.getUsersBySupervisorId(supervisorId);
      
      // Remove sensitive information
      const sanitizedClients = clients.map(client => {
        const { password, ...clientData } = client;
        return clientData;
      });
      
      res.json(sanitizedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  
  // Routes for supervisor to get client budget information
  app.get("/api/supervisor/client-budget/:clientId", authenticateToken, authorizeRoles([UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      
      // Check if client is assigned to this supervisor
      const supervisorId = req.user.id;
      const clients = await storage.getUsersBySupervisorId(supervisorId);
      const client = clients.find(c => c.id === clientId);
      
      if (!client) {
        return res.status(403).json({ message: "You don't have permission to view this client's budget" });
      }
      
      // Get client's budget items
      const budgetItems = await storage.getBudgetItemsByUserId(clientId);
      
      // Enhance budget items with payment status if not already present
      const enhancedItems = budgetItems.map(item => {
        // Default status
        let paymentStatus = item.paymentStatus || 'not_paid';
        
        // If legacy item without payment status but with paid flag
        if (!item.paymentStatus && item.paid) {
          paymentStatus = 'fully_paid';
        } 
        // If has advance payment but not marked as fully paid
        else if (!item.paymentStatus && item.advanceAmount && item.advanceAmount > 0) {
          paymentStatus = 'advance_paid';
        }
        
        return {
          ...item,
          paymentStatus
        };
      });
      
      res.json(enhancedItems);
    } catch (error) {
      console.error("Error fetching client budget:", error);
      res.status(500).json({ message: "Failed to retrieve budget information" });
    }
  });
  
  // Get payment summary for a client's budget items
  app.get("/api/supervisor/payment-summary/:clientId", authenticateToken, authorizeRoles([UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      
      // Check if client is assigned to this supervisor
      const supervisorId = req.user.id;
      const clients = await storage.getUsersBySupervisorId(supervisorId);
      const client = clients.find(c => c.id === clientId);
      
      if (!client) {
        return res.status(403).json({ message: "You don't have permission to view this client's payment data" });
      }
      
      // Get client's budget items
      const budgetItems = await storage.getBudgetItemsByUserId(clientId);
      
      // Ensure all items have payment status
      const enhancedItems = budgetItems.map(item => {
        // Default status
        let paymentStatus = item.paymentStatus || 'not_paid';
        
        // If legacy item without payment status but with paid flag
        if (!item.paymentStatus && item.paid) {
          paymentStatus = 'fully_paid';
        } 
        // If has advance payment but not marked as fully paid
        else if (!item.paymentStatus && item.advanceAmount && item.advanceAmount > 0) {
          paymentStatus = 'advance_paid';
        }
        
        return {
          ...item,
          paymentStatus
        };
      });
      
      // Calculate payment metrics
      const totalBudget = enhancedItems.reduce((sum, item) => sum + item.estimatedCost, 0);
      const totalSpent = enhancedItems.reduce((sum, item) => {
        if (item.actualCost || item.paid) {
          return sum + (item.actualCost || item.estimatedCost);
        }
        return sum;
      }, 0);
      const totalAdvancePaid = enhancedItems.reduce((sum, item) => sum + (item.advanceAmount || 0), 0);
      
      // Count items by payment status
      const pendingCount = enhancedItems.filter(item => item.paymentStatus === 'not_paid').length;
      const advanceCount = enhancedItems.filter(item => item.paymentStatus === 'advance_paid').length;
      const partialCount = enhancedItems.filter(item => item.paymentStatus === 'partially_paid').length;
      const paidCount = enhancedItems.filter(item => item.paymentStatus === 'fully_paid').length;
      
      // Group by category
      const categorySummary = enhancedItems.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = { 
            total: 0, 
            paid: 0, 
            pending: 0,
            itemCount: 0 
          };
        }
        
        acc[item.category].total += item.estimatedCost;
        acc[item.category].itemCount += 1;
        
        if (item.paymentStatus === 'fully_paid') {
          acc[item.category].paid += item.estimatedCost;
        } else if (item.paymentStatus === 'advance_paid' && item.advanceAmount) {
          acc[item.category].paid += item.advanceAmount;
          acc[item.category].pending += (item.estimatedCost - item.advanceAmount);
        } else {
          acc[item.category].pending += item.estimatedCost;
        }
        
        return acc;
      }, {} as Record<string, { total: number, paid: number, pending: number, itemCount: number }>);
      
      res.json({
        summary: {
          totalBudget,
          totalSpent,
          totalAdvancePaid,
          percentSpent: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
          percentAdvancePaid: totalBudget > 0 ? Math.round((totalAdvancePaid / totalBudget) * 100) : 0,
          paymentStatusCounts: {
            pending: pendingCount,
            advance: advanceCount,
            partial: partialCount,
            paid: paidCount,
            total: enhancedItems.length
          }
        },
        categorySummary,
        pendingItems: enhancedItems.filter(item => item.paymentStatus === 'not_paid'),
        advanceItems: enhancedItems.filter(item => item.paymentStatus === 'advance_paid'),
        partiallyPaidItems: enhancedItems.filter(item => item.paymentStatus === 'partially_paid'),
        fullyPaidItems: enhancedItems.filter(item => item.paymentStatus === 'fully_paid')
      });
    } catch (error) {
      console.error("Error generating payment summary: ", error);
      res.status(500).json({ error: "Failed to generate payment summary" });
    }
  });
  
  // Get client information for supervisor
  app.get("/api/supervisor/client-info/:clientId", authenticateToken, authorizeRoles([UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      
      // Check if client is assigned to this supervisor
      const supervisorId = req.user.id;
      const clients = await storage.getUsersBySupervisorId(supervisorId);
      const client = clients.find(c => c.id === clientId);
      
      if (!client) {
        return res.status(403).json({ message: "You don't have permission to view this client's information" });
      }
      
      // Return client info
      const user = await storage.getUser(clientId);
      if (!user) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching client info:", error);
      res.status(500).json({ message: "Failed to retrieve client information" });
    }
  });
  
  // API endpoint for getting messages between two users
  app.get("/api/messages/:userId", authenticateToken, async (req: Request, res: Response) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = parseInt(req.params.userId);
      
      const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
      
      // Mark messages as read
      await storage.markAllMessagesAsRead(otherUserId, currentUserId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  // Get all available users to chat with (based on role)
  app.get("/api/chat/users", authenticateToken, async (req: Request, res: Response) => {
    try {
      const currentUserId = req.user.id;
      const currentUserRole = req.user.role;
      
      // Get all users
      let users = await storage.getAllUsers();
      
      // Filter out the current user
      users = users.filter(user => user.id !== currentUserId);
      
      // If current user is a client, only show supervisors, vendors, and admins
      if ([UserRole.BRIDE, UserRole.GROOM, UserRole.FAMILY].includes(currentUserRole)) {
        users = users.filter(user => 
          [UserRole.SUPERVISOR, UserRole.VENDOR, UserRole.ADMIN].includes(user.role as any)
        );
      }
      
      // If current user is a supervisor, only show clients assigned to them, vendors, and admins
      if (currentUserRole === UserRole.SUPERVISOR) {
        const clientsAssigned = await storage.getUsersBySupervisorId(currentUserId);
        const clientIds = clientsAssigned.map(client => client.id);
        
        users = users.filter(user => 
          clientIds.includes(user.id) || 
          user.role === UserRole.VENDOR || 
          user.role === UserRole.ADMIN
        );
      }
      
      // If current user is a vendor, only show clients, supervisors, and admins
      if (currentUserRole === UserRole.VENDOR) {
        users = users.filter(user => 
          [UserRole.BRIDE, UserRole.GROOM, UserRole.FAMILY, UserRole.SUPERVISOR, UserRole.ADMIN].includes(user.role as any)
        );
      }
      
      // Remove password field from users
      const safeUsers = users.map(({ password, ...user }) => user);
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching chat users:", error);
      res.status(500).json({ message: "Failed to fetch chat users" });
    }
  });
  
  // Get unread message counts for each user
  app.get("/api/messages/unread/count", authenticateToken, async (req: Request, res: Response) => {
    try {
      const currentUserId = req.user.id;
      const unreadMessages = await storage.getUnreadMessagesForUser(currentUserId);
      
      // Group by sender (fromUserId)
      const countByUser: Record<string, number> = {};
      
      unreadMessages.forEach(message => {
        const fromId = message.fromUserId.toString();
        countByUser[fromId] = (countByUser[fromId] || 0) + 1;
      });
      
      res.json(countByUser);
    } catch (error) {
      console.error("Error fetching unread message counts:", error);
      res.status(500).json({ message: "Failed to fetch unread message counts" });
    }
  });
  
  // Get the last message between the current user and each other user
  app.get("/api/messages/last", authenticateToken, async (req: Request, res: Response) => {
    try {
      const currentUserId = req.user.id;
      
      // Get all users
      const users = await storage.getAllUsers();
      const otherUsers = users.filter(user => user.id !== currentUserId);
      
      const lastMessagesByUser: Record<string, any> = {};
      
      // For each user, get the most recent message
      for (const otherUser of otherUsers) {
        const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUser.id);
        
        if (messages.length > 0) {
          // Sort by createdAt descending to get the most recent message
          messages.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          lastMessagesByUser[otherUser.id.toString()] = messages[0];
        }
      }
      
      res.json(lastMessagesByUser);
    } catch (error) {
      console.error("Error fetching last messages:", error);
      res.status(500).json({ message: "Failed to fetch last messages" });
    }
  });
  
  // Helper function to update contact status after messaging
  async function updateContactStatusAfterMessage(fromUserId: number, toUserId: number) {
    try {
      // Determine if this is supervisor-client communication
      const fromUser = await storage.getUser(fromUserId);
      const toUser = await storage.getUser(toUserId);
      
      if (!fromUser || !toUser) return;
      
      // If communication between supervisor and client
      if (
        (fromUser.role === UserRole.SUPERVISOR && [UserRole.BRIDE, UserRole.GROOM, UserRole.FAMILY].includes(toUser.role as any)) ||
        (toUser.role === UserRole.SUPERVISOR && [UserRole.BRIDE, UserRole.GROOM, UserRole.FAMILY].includes(fromUser.role as any))
      ) {
        const clientId = fromUser.role === UserRole.SUPERVISOR ? toUserId : fromUserId;
        const supervisorId = fromUser.role === UserRole.SUPERVISOR ? fromUserId : toUserId;
        
        // Get existing contact status or create new one
        let contactStatus = await storage.getContactStatusByUserId(clientId);
        
        if (contactStatus) {
          await storage.updateContactStatus(contactStatus.id, {
            status: "active",
            lastUpdated: new Date(),
            lastContactDate: new Date()
          });
        } else {
          await storage.createContactStatus({
            userId: clientId,
            supervisorId,
            status: "active",
            lastUpdated: new Date(),
            lastContactDate: new Date()
          });
        }
      }
    } catch (error) {
      console.error("Failed to update contact status:", error);
    }
  }
  
  // WebSocket Handling for real-time communication
  const authenticatedSockets = new Map();
  
  io.on('connection', (socket) => {
    console.log('New connection established:', socket.id);
    
    // Authentication
    socket.on('authenticate', async (data) => {
      try {
        // Handle different formats of authentication data
        let token;
        if (typeof data === 'string') {
          token = data;
        } else if (data && typeof data === 'object' && 'email' in data) {
          // Client sent {email: string} format instead of token
          const user = await storage.getUserByEmail(data.email);
          if (!user) {
            socket.emit('authentication_error', 'User not found');
            return;
          }
          
          // Store authenticated socket for email-based auth
          authenticatedSockets.set(socket.id, {
            userId: user.id,
            role: user.role,
            name: user.name
          });
          
          console.log(`User authenticated by email: ${user.name} (${user.id})`);
          socket.emit('authenticated', { success: true, userId: user.id, role: user.role });
          
          // Get unread messages count for this user
          const unreadCount = await storage.getUnreadMessagesCount(user.id);
          socket.emit('unread_count', { count: unreadCount });
          return;
        } else {
          socket.emit('authentication_error', 'Invalid authentication data');
          return;
        }
        
        // Token-based authentication
        const decoded = await verifyToken(token);
        if (!decoded || !decoded.id) {
          socket.emit('authentication_error', 'Invalid token');
          return;
        }
        
        const user = await storage.getUser(decoded.id);
        if (!user) {
          socket.emit('authentication_error', 'User not found');
          return;
        }
        
        // Store authenticated socket
        authenticatedSockets.set(socket.id, {
          userId: user.id,
          role: user.role,
          name: user.name
        });
        
        console.log(`User authenticated by token: ${user.name} (${user.id})`);
        socket.emit('authenticated', { success: true, userId: user.id, role: user.role });
        
        // Get unread messages count for this user
        const unreadCount = await storage.getUnreadMessagesCount(user.id);
        socket.emit('unread_count', { count: unreadCount });
      } catch (error) {
        console.error("Socket authentication error:", error);
        socket.emit('authentication_error', 'Authentication failed');
      }
    });
    
    // Send message
    socket.on('send_message', async (data) => {
      try {
        const socketData = authenticatedSockets.get(socket.id);
        if (!socketData) {
          socket.emit('error', 'Not authenticated');
          return;
        }
        
        const { toUserId, content, messageType = 'text' } = data;
        
        // Create the message in database
        const message = await storage.createMessage({
          fromUserId: socketData.userId,
          toUserId,
          content,
          messageType,
          read: false
        });
        
        // Update contact status
        await updateContactStatusAfterMessage(socketData.userId, toUserId);
        
        // Emit to sender with message info
        socket.emit('message_sent', message);
        
        // Send to recipient if they're online
        const recipientSocketId = Array.from(authenticatedSockets.entries())
          .find(([_, data]) => data.userId === toUserId)?.[0];
        
        if (recipientSocketId) {
          const recipientSocket = io.sockets.sockets.get(recipientSocketId);
          if (recipientSocket) {
            // Add sender name to the message
            const messageWithSender = { ...message, senderName: socketData.name };
            recipientSocket.emit('receive_message', messageWithSender);
            
            // Update unread count for recipient
            const unreadCount = await storage.getUnreadMessagesCount(toUserId);
            recipientSocket.emit('unread_count', { count: unreadCount });
          }
        }
        
        // Supervisor allocation notification
        if (messageType === 'supervisor_allocation') {
          socket.emit('supervisor_allocated', { clientId: toUserId, supervisorId: socketData.userId });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit('error', 'Failed to send message');
      }
    });
    
    // Mark messages as read
    socket.on('mark_read', async (fromUserId) => {
      try {
        const socketData = authenticatedSockets.get(socket.id);
        if (!socketData) {
          socket.emit('error', 'Not authenticated');
          return;
        }
        
        await storage.markAllMessagesAsRead(fromUserId, socketData.userId);
        
        // Update unread count
        const unreadCount = await storage.getUnreadMessagesCount(socketData.userId);
        socket.emit('unread_count', { count: unreadCount });
        
        // If sender is online, notify them their messages have been read
        const senderSocketId = Array.from(authenticatedSockets.entries())
          .find(([_, data]) => data.userId === fromUserId)?.[0];
        
        if (senderSocketId) {
          const senderSocket = io.sockets.sockets.get(senderSocketId);
          if (senderSocket) {
            senderSocket.emit('messages_read', { byUserId: socketData.userId });
          }
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
        socket.emit('error', 'Failed to mark messages as read');
      }
    });
    
    // Notify supervisor allocation
    socket.on('notify_supervisor_allocation', async (data) => {
      try {
        const socketData = authenticatedSockets.get(socket.id);
        if (!socketData) {
          socket.emit('error', 'Not authenticated');
          return;
        }
        
        const { clientId, supervisorId } = data;
        
        // If supervisor is online, notify them
        const supervisorSocketId = Array.from(authenticatedSockets.entries())
          .find(([_, data]) => data.userId === supervisorId)?.[0];
        
        if (supervisorSocketId) {
          const supervisorSocket = io.sockets.sockets.get(supervisorSocketId);
          if (supervisorSocket) {
            supervisorSocket.emit('supervisor_allocation_notification', { 
              clientId, 
              message: 'You have been assigned a new client' 
            });
          }
        }
        
        // If client is online, notify them
        const clientSocketId = Array.from(authenticatedSockets.entries())
          .find(([_, data]) => data.userId === clientId)?.[0];
        
        if (clientSocketId) {
          const clientSocket = io.sockets.sockets.get(clientSocketId);
          if (clientSocket) {
            clientSocket.emit('supervisor_allocation_notification', { 
              supervisorId, 
              message: 'A supervisor has been assigned to you' 
            });
          }
        }
      } catch (error) {
        console.error("Error notifying supervisor allocation:", error);
        socket.emit('error', 'Failed to notify supervisor allocation');
      }
    });
    
    // Disconnect handling
    socket.on('disconnect', () => {
      console.log('Connection closed:', socket.id);
      authenticatedSockets.delete(socket.id);
    });
  });

  // Contact Form Submissions routes
  // Submit contact form (public route)
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactFormSubmissionSchema.parse({
        ...req.body,
        status: "new",
      });
      
      const submission = await storage.createContactFormSubmission(validatedData);
      
      // Send email notification to admin
      try {
        const adminUsers = await storage.getUsersByRole(UserRole.ADMIN);
        if (adminUsers.length > 0) {
          await Promise.all(adminUsers.map(admin => {
            return sendWelcomeEmail(
              admin.name, 
              admin.email, 
              admin.role, 
              "New Contact Form Submission", 
              `A new contact form has been submitted by ${submission.name} (${submission.email}).\n\nMessage: ${submission.message}`
            );
          }));
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
      
      res.status(201).json({ 
        success: true, 
        message: "Thank you for contacting us. We will get back to you shortly." 
      });
    } catch (error) {
      console.error("Contact form submission error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Get all contact form submissions (admin only)
  app.get("/api/admin/contact-submissions", authenticateToken, authorizeRoles([UserRole.ADMIN, UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const submissions = await storage.getAllContactFormSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Get contact submissions error:", error);
      res.status(500).json({ message: "Failed to retrieve contact submissions" });
    }
  });

  // Get contact form submissions by status
  app.get("/api/admin/contact-submissions/status/:status", authenticateToken, authorizeRoles([UserRole.ADMIN, UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const status = req.params.status;
      const submissions = await storage.getContactFormSubmissionsByStatus(status);
      res.json(submissions);
    } catch (error) {
      console.error("Get contact submissions by status error:", error);
      res.status(500).json({ message: "Failed to retrieve contact submissions" });
    }
  });

  // Get contact form submissions by assignee
  app.get("/api/admin/contact-submissions/assignee/:assigneeId", authenticateToken, authorizeRoles([UserRole.ADMIN, UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const assigneeId = parseInt(req.params.assigneeId);
      const submissions = await storage.getContactFormSubmissionsByAssignee(assigneeId);
      res.json(submissions);
    } catch (error) {
      console.error("Get contact submissions by assignee error:", error);
      res.status(500).json({ message: "Failed to retrieve contact submissions" });
    }
  });

  // Assign contact form submission to staff
  app.patch("/api/admin/contact-submissions/:id/assign", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const { assignedTo } = req.body;
      
      if (!assignedTo) {
        return res.status(400).json({ message: "assignedTo is required" });
      }
      
      const assigneeId = parseInt(assignedTo);
      
      // Verify the assignee exists and is a staff member
      const assignee = await storage.getUser(assigneeId);
      if (!assignee || (assignee.role !== UserRole.SUPERVISOR && assignee.role !== UserRole.ADMIN)) {
        return res.status(400).json({ message: "Invalid assignee" });
      }
      
      const submission = await storage.assignContactFormSubmission(submissionId, assigneeId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Assign contact submission error:", error);
      res.status(500).json({ message: "Failed to assign contact submission" });
    }
  });

  // Update contact form submission status
  app.patch("/api/admin/contact-submissions/:id/status", authenticateToken, authorizeRoles([UserRole.ADMIN, UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "status is required" });
      }
      
      const submission = await storage.updateContactFormSubmission(submissionId, { status });
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Update contact submission status error:", error);
      res.status(500).json({ message: "Failed to update contact submission status" });
    }
  });

  // Add notes to contact form submission
  app.patch("/api/admin/contact-submissions/:id/notes", authenticateToken, authorizeRoles([UserRole.ADMIN, UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const { notes } = req.body;
      
      if (notes === undefined) {
        return res.status(400).json({ message: "notes are required" });
      }
      
      const submission = await storage.updateContactFormSubmission(submissionId, { notes });
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Update contact submission notes error:", error);
      res.status(500).json({ message: "Failed to update contact submission notes" });
    }
  });

  // Export contact form submissions to Excel
  app.get("/api/admin/contact-submissions/export/excel", authenticateToken, authorizeRoles([UserRole.ADMIN, UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      console.log("Starting Excel export process");
      
      const submissions = await storage.getAllContactFormSubmissions();
      console.log(`Retrieved ${submissions.length} submissions for export`);
      
      // Process submissions first to enhance with assignee names
      const enhancedSubmissions = await Promise.all(submissions.map(async (submission) => {
        let assignedToName = 'Unassigned';
        if (submission.assignedTo) {
          const assignee = await storage.getUser(submission.assignedTo);
          if (assignee) {
            assignedToName = assignee.name;
          }
        }
        return { ...submission, assignedToName };
      }));
      
      console.log(`Enhanced ${enhancedSubmissions.length} submissions with assignee names`);
      
      // Create a new Excel workbook and worksheet
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Contact Submissions');
      
      console.log("Created workbook and worksheet");
      
      // Define columns
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Message', key: 'message', width: 50 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Notes', key: 'notes', width: 40 },
        { header: 'Assigned To', key: 'assignedToName', width: 20 },
        { header: 'Created At', key: 'createdAt', width: 20 },
        { header: 'Updated At', key: 'updatedAt', width: 20 }
      ];
      
      console.log("Defined columns");
      
      // Add rows
      worksheet.addRows(enhancedSubmissions);
      
      console.log("Added rows to worksheet");
      
      // Format date columns
      worksheet.getColumn('createdAt').numFmt = 'yyyy-mm-dd hh:mm:ss';
      worksheet.getColumn('updatedAt').numFmt = 'yyyy-mm-dd hh:mm:ss';
      
      console.log("Formatted date columns");
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=contact-submissions.xlsx');
      
      console.log("Set response headers");
      
      // Write to response
      console.log("Writing Excel data to response...");
      await workbook.xlsx.write(res);
      console.log("Excel data written successfully");
      
      res.end();
      console.log("Response ended");
    } catch (error) {
      console.error("Export contact submissions to Excel error:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      res.status(500).json({ message: "Failed to export contact submissions to Excel", error: error.message });
    }
  });

  // Export contact form submissions to PDF
  app.get("/api/admin/contact-submissions/export/pdf", authenticateToken, authorizeRoles([UserRole.ADMIN, UserRole.SUPERVISOR]), async (req: Request, res: Response) => {
    try {
      console.log("Starting PDF export process");
      
      const submissions = await storage.getAllContactFormSubmissions();
      console.log(`Retrieved ${submissions.length} submissions for PDF export`);
      
      // Create a new PDF document
      const pdfkit = await import('pdfkit');
      const doc = new pdfkit.default({ margin: 50 });
      
      console.log("Created PDF document");
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=contact-submissions.pdf');
      
      console.log("Set PDF response headers");
      
      // Pipe the PDF to the response
      doc.pipe(res);
      
      console.log("Piped PDF to response");
      
      // Add title
      doc.fontSize(20).text('Contact Form Submissions', { align: 'center' });
      doc.moveDown();
      
      // Add date
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);
      
      console.log("Added PDF header and date");
      
      // Add submissions
      for (let i = 0; i < submissions.length; i++) {
        const submission = submissions[i];
        doc.fontSize(14).text(`Submission #${submission.id}`, { underline: true });
        doc.fontSize(12).text(`Name: ${submission.name}`);
        doc.fontSize(12).text(`Email: ${submission.email}`);
        doc.fontSize(12).text(`Status: ${submission.status}`);
        doc.fontSize(12).text(`Created: ${new Date(submission.createdAt).toLocaleString()}`);
        doc.fontSize(12).text(`Message:`, { underline: true });
        doc.fontSize(10).text(submission.message);
        
        if (submission.notes) {
          doc.fontSize(12).text(`Notes:`, { underline: true });
          doc.fontSize(10).text(submission.notes);
        }
        
        // Add a separator unless it's the last item
        if (i < submissions.length - 1) {
          doc.moveDown();
          doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown();
        }
      }
      
      console.log(`Added ${submissions.length} submissions to PDF`);
      
      // Finalize the PDF
      console.log("Finalizing PDF...");
      doc.end();
      console.log("PDF finalized");
    } catch (error) {
      console.error("Export contact submissions to PDF error:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      res.status(500).json({ message: "Failed to export contact submissions to PDF", error: error.message });
    }
  });

  // Admin Action Logs routes
  // Get all admin action logs (admin only)
  app.get("/api/admin/action-logs", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const logs = await storage.getAdminActionLogs();
      res.json(logs);
    } catch (error) {
      console.error("Get admin action logs error:", error);
      res.status(500).json({ message: "Failed to retrieve admin action logs" });
    }
  });

  // Get admin action logs by admin
  app.get("/api/admin/action-logs/admin/:adminId", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const adminId = parseInt(req.params.adminId);
      const logs = await storage.getAdminActionLogsByAdmin(adminId);
      res.json(logs);
    } catch (error) {
      console.error("Get admin action logs by admin error:", error);
      res.status(500).json({ message: "Failed to retrieve admin action logs" });
    }
  });

  // Get admin action logs by user
  app.get("/api/admin/action-logs/user/:userId", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const logs = await storage.getAdminActionLogsByUser(userId);
      res.json(logs);
    } catch (error) {
      console.error("Get admin action logs by user error:", error);
      res.status(500).json({ message: "Failed to retrieve admin action logs" });
    }
  });

  // Get admin action logs by action type
  app.get("/api/admin/action-logs/action/:action", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const action = req.params.action;
      const logs = await storage.getAdminActionLogsByAction(action);
      res.json(logs);
    } catch (error) {
      console.error("Get admin action logs by action error:", error);
      res.status(500).json({ message: "Failed to retrieve admin action logs" });
    }
  });

  // Create admin action log (used internally when admin performs actions)
  app.post("/api/admin/action-logs", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const logData: InsertAdminActionLog = {
        adminId: req.user.id,
        userId: req.body.userId,
        action: req.body.action,
        details: req.body.details || null
      };
      
      const log = await storage.createAdminActionLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Create admin action log error:", error);
      res.status(500).json({ message: "Failed to create admin action log" });
    }
  });

  // Register admin dashboard routes
  app.use('/api/admin', adminDashboardRoutes);

  return httpServer;
}
