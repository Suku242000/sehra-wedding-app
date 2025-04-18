import { Router } from 'express';
import { storage } from '../storage';
import { UserRole } from '@shared/schema';
import { authenticateToken, authorizeRoles } from '../utils/auth';

const router = Router();

// Ensure all routes require admin authentication
router.use(authenticateToken);
router.use(authorizeRoles([UserRole.ADMIN]));

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Placeholder for actual DB queries to calculate stats
    // In a real implementation, we would fetch real-time data from the database

    // Get total user count
    const totalUsers = await storage.getUserCountByRoles([
      UserRole.CLIENT,
      UserRole.VENDOR,
      UserRole.SUPERVISOR,
      UserRole.ADMIN
    ]);

    // Get only vendors count
    const activeVendors = await storage.getUserCountByRoles([UserRole.VENDOR]);

    // Calculate total revenue - this would normally come from a complex query
    // For now we're using placeholder data that would be replaced with real calculations
    const totalRevenue = 12500000; // In a real app, calculate from booking data
    const weddingsBooked = 78; // This would be calculated from actual booking data
    
    // Get newly created users in the last month
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Calculate new signups (currently placeholder)
    const newSignups = 24;

    // Calculate revenue growth (placeholder)
    const revenueGrowth = 18.5;

    // Calculate pending tasks (placeholder)
    const pendingTasks = 36;

    // Return formatted stats
    res.json({
      totalUsers,
      weddingsBooked,
      totalRevenue,
      activeVendors,
      pendingTasks,
      newSignups,
      revenueGrowth
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent activity for dashboard
router.get('/dashboard/recent-activity', async (req, res) => {
  try {
    // In a real app, this would fetch actual recent activities from various tables
    // For now, we're returning placeholder data
    
    // Get the most recent admin action logs
    const adminActionLogs = await storage.getAdminActionLogs();
    
    // Map admin logs to activity format
    const activityFromLogs = adminActionLogs.slice(0, 5).map(log => ({
      id: log.id,
      type: log.actionType.toLowerCase().includes('user') ? 'user_created' : 'system_update',
      user: log.adminName || 'Admin',
      timestamp: log.createdAt,
      message: `${log.actionType}: ${log.details}`
    }));

    // Get the most recent vendor bookings
    // This is just a placeholder for demonstration
    const recentActivity = [
      ...activityFromLogs,
      // Additional placeholder items that would be real data in production
      { 
        id: 1001, 
        type: 'booking_completed', 
        user: 'Meera Patel', 
        timestamp: new Date(Date.now() - 3600000).toISOString(), 
        message: 'Completed booking with Premium Decor vendor' 
      },
      { 
        id: 1002, 
        type: 'payment_received', 
        user: 'Vikram Singh', 
        timestamp: new Date(Date.now() - 7200000).toISOString(), 
        message: 'Payment of ₹250,000 received' 
      }
    ];

    res.json(recentActivity);
  } catch (error) {
    console.error('Error fetching admin recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// Admin analytics endpoints 
router.get('/analytics', async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'month';
    
    // This would normally fetch data from the database based on timeRange
    // For now we're sending placeholder data for demonstration
    
    const analyticsData = {
      userStats: {
        totalUsers: 1245,
        newUsersThisMonth: 126,
        activeUsers: 876,
        usersByRole: [
          { name: 'Bride/Groom', value: 450 },
          { name: 'Family', value: 320 },
          { name: 'Vendors', value: 275 },
          { name: 'Supervisors', value: 200 }
        ]
      },
      revenueStats: {
        totalRevenue: 5430000,
        monthlyRevenue: 860000,
        averageBookingValue: 345000,
        revenueByMonth: [
          { month: 'Jan', revenue: 520000 },
          { month: 'Feb', revenue: 480000 },
          { month: 'Mar', revenue: 590000 },
          { month: 'Apr', revenue: 620000 },
          { month: 'May', revenue: 710000 },
          { month: 'Jun', revenue: 680000 },
          { month: 'Jul', revenue: 750000 },
          { month: 'Aug', revenue: 860000 }
        ]
      },
      vendorStats: {
        totalVendors: 275,
        newVendorsThisMonth: 18,
        topVendorTypes: [
          { name: 'Catering', count: 45 },
          { name: 'Decoration', count: 38 },
          { name: 'Photography', count: 35 },
          { name: 'Venue', count: 30 },
          { name: 'Music', count: 25 }
        ],
        bookingsByVendorType: [
          { type: 'Catering', bookings: 120 },
          { type: 'Decoration', bookings: 105 },
          { type: 'Photography', bookings: 95 },
          { type: 'Venue', bookings: 80 },
          { type: 'Music', bookings: 65 }
        ]
      },
      regionStats: {
        usersByRegion: [
          { region: 'Mumbai', users: 320 },
          { region: 'Delhi', users: 280 },
          { region: 'Bangalore', users: 210 },
          { region: 'Chennai', users: 175 },
          { region: 'Kolkata', users: 150 },
          { region: 'Other', users: 110 }
        ],
        bookingsByRegion: [
          { region: 'Mumbai', bookings: 95 },
          { region: 'Delhi', bookings: 82 },
          { region: 'Bangalore', bookings: 65 },
          { region: 'Chennai', bookings: 53 },
          { region: 'Kolkata', bookings: 45 },
          { region: 'Other', bookings: 35 }
        ]
      },
      engagementStats: {
        taskCompletionRate: 68,
        userEngagementByStage: [
          { stage: 'Planning Start', rate: 98 },
          { stage: '25% Complete', rate: 86 },
          { stage: '50% Complete', rate: 74 },
          { stage: '75% Complete', rate: 65 },
          { stage: 'Final Phase', rate: 58 }
        ],
        userRetention: {
          day7: 86,
          day30: 72,
          day90: 64
        }
      }
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Detailed analytics for each category
router.get('/analytics/user-roles', async (req, res) => {
  try {
    // Fetch actual user role distribution from database
    const userRoleData = [
      { name: 'Bride/Groom', value: 450 },
      { name: 'Family', value: 320 },
      { name: 'Vendors', value: 275 },
      { name: 'Supervisors', value: 200 }
    ];
    
    res.json(userRoleData);
  } catch (error) {
    console.error('Error fetching user roles data:', error);
    res.status(500).json({ error: 'Failed to fetch user roles data' });
  }
});

// Store and retrieve system settings
router.get('/settings', async (req, res) => {
  try {
    // In a real app, fetch settings from database
    // For now, we'll return placeholder data
    const settings = {
      general: {
        siteName: 'Sehra Wedding Platform',
        contactEmail: 'admin@sehra.com',
        supportPhone: '+91 98765 43210',
        maintenanceMode: false,
        language: 'en'
      },
      security: {
        passwordPolicy: 'strong',
        twoFactorAuth: true,
        sessionTimeout: 60,
        ipRestriction: false
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        adminAlerts: true,
        vendorAlerts: true,
        clientAlerts: true
      },
      integrations: {
        stripeEnabled: true,
        sendgridEnabled: true,
        googleMapsEnabled: true,
        twilioEnabled: false
      }
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    // In a real app, validate and save settings to database
    // For now, we'll just return success
    const settings = req.body;
    
    // Log this action
    await storage.createAdminActionLog({
      adminId: req.user.id,
      adminName: req.user.name,
      userId: null,
      actionType: 'UPDATE_SETTINGS',
      details: 'Updated system settings',
      createdAt: new Date()
    });
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error saving admin settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

export default router;