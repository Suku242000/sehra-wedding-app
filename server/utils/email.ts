import nodemailer from 'nodemailer';

// In production, use SendGrid or similar service
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'info@sehra.com';

// For development, use ethereal.email or similar service
let transporter: nodemailer.Transporter;

// Initialize email transport
export const initializeEmailTransport = async () => {
  if (SENDGRID_API_KEY) {
    // Use SendGrid
    transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: SENDGRID_API_KEY
      }
    });
  } else {
    // Use ethereal.email for development
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('Email preview URL:', nodemailer.getTestMessageUrl);
  }
};

// Base email sending function
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> => {
  try {
    if (!transporter) {
      await initializeEmailTransport();
    }
    
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text: text || '',
      html
    });
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Welcome email to new users
export const sendWelcomeEmail = async (
  name: string,
  email: string,
  role: string
): Promise<boolean> => {
  const subject = `Welcome to Sehra - Your Indian Wedding Management Platform`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; color: #2C2C2C; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #800000; padding: 20px; text-align: center;">
        <h1 style="color: #FFD700; margin: 0;">Sehra</h1>
        <p style="color: #FFC0CB; font-style: italic;">Creating unforgettable wedding memories</p>
      </div>
      
      <div style="padding: 20px; background-color: #F5F5F5;">
        <h2>Welcome, ${name}!</h2>
        <p>Thank you for registering with Sehra as a ${role}.</p>
        <p>We're excited to help you create magical memories for your special day.</p>
        <p>You can now log in to your account and start planning your perfect wedding!</p>
        
        <div style="background-color: #800000; color: white; padding: 10px 15px; display: inline-block; margin: 15px 0; border-radius: 4px;">
          <a href="https://sehra.com/login" style="color: #FFD700; text-decoration: none;">Login to Your Account</a>
        </div>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
      </div>
      
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Sehra Wedding Management. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
};

// Task reminder email
export const sendTaskReminderEmail = async (
  name: string,
  email: string,
  taskTitle: string,
  dueDate: string
): Promise<boolean> => {
  const subject = `Reminder: Wedding Task Due Soon - ${taskTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; color: #2C2C2C; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #800000; padding: 20px; text-align: center;">
        <h1 style="color: #FFD700; margin: 0;">Sehra</h1>
        <p style="color: #FFC0CB; font-style: italic;">Your Wedding Task Reminder</p>
      </div>
      
      <div style="padding: 20px; background-color: #F5F5F5;">
        <h2>Hello, ${name}!</h2>
        <p>This is a reminder that your wedding task is due soon:</p>
        
        <div style="background-color: #FFF; padding: 15px; border-left: 4px solid #800000; margin: 15px 0;">
          <p style="margin: 0; font-weight: bold;">${taskTitle}</p>
          <p style="margin: 5px 0 0;">Due: ${dueDate}</p>
        </div>
        
        <p>Please make sure to complete this task on time to keep your wedding planning on track!</p>
        
        <div style="background-color: #800000; color: white; padding: 10px 15px; display: inline-block; margin: 15px 0; border-radius: 4px;">
          <a href="https://sehra.com/dashboard" style="color: #FFD700; text-decoration: none;">Go to Dashboard</a>
        </div>
      </div>
      
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Sehra Wedding Management. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
};

// Booking confirmation email
export const sendBookingConfirmationEmail = async (
  name: string,
  email: string,
  vendorName: string,
  vendorType: string,
  bookingDate: string
): Promise<boolean> => {
  const subject = `Booking Confirmation: ${vendorName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; color: #2C2C2C; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #800000; padding: 20px; text-align: center;">
        <h1 style="color: #FFD700; margin: 0;">Sehra</h1>
        <p style="color: #FFC0CB; font-style: italic;">Your Booking Confirmation</p>
      </div>
      
      <div style="padding: 20px; background-color: #F5F5F5;">
        <h2>Dear ${name},</h2>
        <p>Your booking with ${vendorName} has been confirmed!</p>
        
        <div style="background-color: #FFF; padding: 15px; border: 1px solid #DDD; margin: 15px 0;">
          <p><strong>Vendor:</strong> ${vendorName}</p>
          <p><strong>Service:</strong> ${vendorType}</p>
          <p><strong>Date:</strong> ${bookingDate}</p>
        </div>
        
        <p>We're excited to have this vendor as part of your special day!</p>
        
        <div style="background-color: #800000; color: white; padding: 10px 15px; display: inline-block; margin: 15px 0; border-radius: 4px;">
          <a href="https://sehra.com/dashboard" style="color: #FFD700; text-decoration: none;">View Booking Details</a>
        </div>
      </div>
      
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Sehra Wedding Management. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
};

// Supervisor allocation email
export const sendSupervisorAllocationEmail = async (
  userName: string,
  userEmail: string,
  supervisorName: string,
  supervisorEmail: string,
  supervisorPhone: string,
  weddingDate: string
): Promise<boolean> => {
  const subject = `Your Wedding Supervisor: ${supervisorName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; color: #2C2C2C; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #800000; padding: 20px; text-align: center;">
        <h1 style="color: #FFD700; margin: 0;">Sehra</h1>
        <p style="color: #FFC0CB; font-style: italic;">Your Wedding Supervisor</p>
      </div>
      
      <div style="padding: 20px; background-color: #F5F5F5;">
        <h2>Dear ${userName},</h2>
        <p>We're pleased to inform you that a wedding supervisor has been assigned to your wedding!</p>
        
        <div style="background-color: #FFF; padding: 15px; border: 1px solid #DDD; margin: 15px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #800000;">${supervisorName}</h3>
          <p><strong>Email:</strong> ${supervisorEmail}</p>
          <p><strong>Phone:</strong> ${supervisorPhone}</p>
        </div>
        
        <p>Your supervisor will be your main point of contact for all wedding preparations. They'll coordinate with vendors, help with scheduling, and ensure your special day runs smoothly.</p>
        
        <p>Your wedding is scheduled for: <strong>${weddingDate}</strong></p>
        
        <p>Feel free to reach out to your supervisor with any questions or concerns.</p>
      </div>
      
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Sehra Wedding Management. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return await sendEmail(userEmail, subject, html);
};

// Also send notification to the supervisor
export const sendSupervisorNotificationEmail = async (
  userName: string,
  userEmail: string,
  userPhone: string,
  supervisorName: string,
  supervisorEmail: string,
  weddingDate: string,
  packageType: string
): Promise<boolean> => {
  const subject = `New Wedding Assignment: ${userName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; color: #2C2C2C; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #800000; padding: 20px; text-align: center;">
        <h1 style="color: #FFD700; margin: 0;">Sehra</h1>
        <p style="color: #FFC0CB; font-style: italic;">New Wedding Assignment</p>
      </div>
      
      <div style="padding: 20px; background-color: #F5F5F5;">
        <h2>Dear ${supervisorName},</h2>
        <p>You have been assigned as the supervisor for a new wedding:</p>
        
        <div style="background-color: #FFF; padding: 15px; border: 1px solid #DDD; margin: 15px 0;">
          <p><strong>Client:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Phone:</strong> ${userPhone || 'Not provided'}</p>
          <p><strong>Wedding Date:</strong> ${weddingDate || 'Not set yet'}</p>
          <p><strong>Package:</strong> ${packageType}</p>
        </div>
        
        <p>Please reach out to the client within 24 hours to introduce yourself and discuss their wedding plans.</p>
        
        <div style="background-color: #800000; color: white; padding: 10px 15px; display: inline-block; margin: 15px 0; border-radius: 4px;">
          <a href="https://sehra.com/supervisor-dashboard" style="color: #FFD700; text-decoration: none;">View Assignment Details</a>
        </div>
      </div>
      
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Sehra Wedding Management. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return await sendEmail(supervisorEmail, subject, html);
};
