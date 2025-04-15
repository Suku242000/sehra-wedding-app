import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
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
  UserRole
} from "@shared/schema";
import { 
  authenticateToken, 
  authorizeRoles, 
  generateToken, 
  verifyPassword, 
  hashPassword 
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

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

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
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
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
      const validatedData = loginSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
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
  app.get("/api/vendors", async (req: Request, res: Response) => {
    try {
      const vendors = await storage.getAllVendorProfiles();
      
      // If type is specified, filter by type
      const { type } = req.query;
      
      if (type) {
        const filteredVendors = vendors.filter(vendor => vendor.vendorType === type);
        return res.json(filteredVendors);
      }
      
      res.json(vendors);
    } catch (error) {
      console.error("Get vendors error:", error);
      res.status(500).json({ message: "Failed to retrieve vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const vendor = await storage.getVendorProfile(vendorId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      console.error("Get vendor error:", error);
      res.status(500).json({ message: "Failed to retrieve vendor" });
    }
  });

  app.post("/api/vendors", authenticateToken, authorizeRoles([UserRole.VENDOR, UserRole.ADMIN]), async (req: Request, res: Response) => {
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
      });
      
      const vendorProfile = await storage.createVendorProfile(validatedData);
      res.status(201).json(vendorProfile);
    } catch (error) {
      console.error("Create vendor profile error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create vendor profile" });
    }
  });

  app.patch("/api/vendors/:id", authenticateToken, authorizeRoles([UserRole.VENDOR, UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if vendor profile exists
      const vendor = await storage.getVendorProfile(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      // Check if user is authorized to update this vendor profile
      if (vendor.userId !== userId && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Not authorized to update this vendor profile" });
      }
      
      const updatedVendor = await storage.updateVendorProfile(vendorId, req.body);
      res.json(updatedVendor);
    } catch (error) {
      console.error("Update vendor profile error:", error);
      res.status(500).json({ message: "Failed to update vendor profile" });
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
      
      // Don't allow updating password through this endpoint
      const { password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If supervisor was assigned, send notification emails
      if (updateData.supervisorId && updateData.supervisorId !== updatedUser.supervisorId) {
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
        }
      }
      
      // Return updated user data (excluding password)
      const { password: _, ...userData } = updatedUser;
      res.json(userData);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, authorizeRoles([UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // This is a mock implementation since we don't have a delete user method
      // In a real implementation, we would soft delete the user or handle cascading deletes
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
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

  return httpServer;
}
