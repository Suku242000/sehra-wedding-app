import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft,
  Save,
  RefreshCw,
  Mail,
  Shield,
  Database,
  CloudUpload,
  Bell
} from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Sample settings state - in a real app, fetch this from API
  const [settings, setSettings] = useState({
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
  });

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[80vh] flex-col">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to view this page.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const handleChange = (category, field, value) => {
    setSettings(prevState => ({
      ...prevState,
      [category]: {
        ...prevState[category],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your configuration has been updated successfully.",
      });
    }, 1000);
  };

  const handleBackupDatabase = () => {
    toast({
      title: "Backup Started",
      description: "Database backup is in progress. You will be notified when complete.",
    });

    // Simulate backup process
    setTimeout(() => {
      toast({
        title: "Backup Complete",
        description: "Database has been backed up successfully.",
      });
    }, 3000);
  };

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="icon"
            className="mr-4"
            onClick={() => navigate('/admin-dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">System Settings</h1>
            <p className="text-gray-600">Configure and manage application parameters</p>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-2 w-full max-w-3xl">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage basic application configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="siteName">Platform Name</Label>
                    <Input 
                      id="siteName" 
                      value={settings.general.siteName} 
                      onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input 
                      id="contactEmail" 
                      type="email" 
                      value={settings.general.contactEmail} 
                      onChange={(e) => handleChange('general', 'contactEmail', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input 
                      id="supportPhone" 
                      value={settings.general.supportPhone} 
                      onChange={(e) => handleChange('general', 'supportPhone', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select 
                      value={settings.general.language} 
                      onValueChange={(value) => handleChange('general', 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Take the site offline for maintenance
                      </p>
                    </div>
                    <Switch 
                      id="maintenanceMode" 
                      checked={settings.general.maintenanceMode} 
                      onCheckedChange={(value) => handleChange('general', 'maintenanceMode', value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset</Button>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Backup and restore system data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Database Backup</h3>
                      <p className="text-sm text-muted-foreground">
                        Create a full backup of the system database
                      </p>
                    </div>
                    <Button onClick={handleBackupDatabase} variant="outline" className="gap-2">
                      <Database className="h-4 w-4" />
                      Backup Now
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Restore from Backup</h3>
                      <p className="text-sm text-muted-foreground">
                        Restore the system from a previous backup
                      </p>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <CloudUpload className="h-4 w-4" />
                      Select File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security and authentication options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="passwordPolicy">Password Policy</Label>
                    <Select 
                      value={settings.security.passwordPolicy} 
                      onValueChange={(value) => handleChange('security', 'passwordPolicy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                        <SelectItem value="standard">Standard (8+ chars, 1 number, 1 special)</SelectItem>
                        <SelectItem value="strong">Strong (12+ chars, uppercase, lowercase, number, special)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input 
                      id="sessionTimeout" 
                      type="number" 
                      value={settings.security.sessionTimeout} 
                      onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for all admin accounts
                      </p>
                    </div>
                    <Switch 
                      id="twoFactorAuth" 
                      checked={settings.security.twoFactorAuth} 
                      onCheckedChange={(value) => handleChange('security', 'twoFactorAuth', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ipRestriction">IP Restriction</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict admin access to specific IP addresses
                      </p>
                    </div>
                    <Switch 
                      id="ipRestriction" 
                      checked={settings.security.ipRestriction} 
                      onCheckedChange={(value) => handleChange('security', 'ipRestriction', value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset</Button>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Update Security
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send system notifications via email
                      </p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={settings.notifications.emailNotifications} 
                      onCheckedChange={(value) => handleChange('notifications', 'emailNotifications', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send system notifications via SMS
                      </p>
                    </div>
                    <Switch 
                      id="smsNotifications" 
                      checked={settings.notifications.smsNotifications} 
                      onCheckedChange={(value) => handleChange('notifications', 'smsNotifications', value)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="adminAlerts">Admin Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications for admin-related events
                      </p>
                    </div>
                    <Switch 
                      id="adminAlerts" 
                      checked={settings.notifications.adminAlerts} 
                      onCheckedChange={(value) => handleChange('notifications', 'adminAlerts', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="vendorAlerts">Vendor Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications for vendor-related events
                      </p>
                    </div>
                    <Switch 
                      id="vendorAlerts" 
                      checked={settings.notifications.vendorAlerts} 
                      onCheckedChange={(value) => handleChange('notifications', 'vendorAlerts', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="clientAlerts">Client Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications for client-related events
                      </p>
                    </div>
                    <Switch 
                      id="clientAlerts" 
                      checked={settings.notifications.clientAlerts} 
                      onCheckedChange={(value) => handleChange('notifications', 'clientAlerts', value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset</Button>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Update Notifications
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>Configure third-party service integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="stripeEnabled">Stripe Payments</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable Stripe payment processing
                      </p>
                    </div>
                    <Switch 
                      id="stripeEnabled" 
                      checked={settings.integrations.stripeEnabled} 
                      onCheckedChange={(value) => handleChange('integrations', 'stripeEnabled', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sendgridEnabled">SendGrid Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable SendGrid for email delivery
                      </p>
                    </div>
                    <Switch 
                      id="sendgridEnabled" 
                      checked={settings.integrations.sendgridEnabled} 
                      onCheckedChange={(value) => handleChange('integrations', 'sendgridEnabled', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="googleMapsEnabled">Google Maps</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable Google Maps integration
                      </p>
                    </div>
                    <Switch 
                      id="googleMapsEnabled" 
                      checked={settings.integrations.googleMapsEnabled} 
                      onCheckedChange={(value) => handleChange('integrations', 'googleMapsEnabled', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twilioEnabled">Twilio SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable Twilio for SMS notifications
                      </p>
                    </div>
                    <Switch 
                      id="twilioEnabled" 
                      checked={settings.integrations.twilioEnabled} 
                      onCheckedChange={(value) => handleChange('integrations', 'twilioEnabled', value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset</Button>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Update Integrations
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminSettings;