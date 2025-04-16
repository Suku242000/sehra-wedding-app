import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { fadeIn, staggerContainer, itemVariants } from '@/lib/motion';
import WeddingDateBanner from './WeddingDateBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SupervisorCard from './SupervisorCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Calendar, Share2, FileText, Upload, Camera, ShieldCheck, Trophy, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MyWeddingSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadDialog, setUploadDialog] = useState(false);
  const [inviteDialog, setInviteDialog] = useState(false);

  // Query tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Query budget items
  const { data: budgetItems = [] } = useQuery({
    queryKey: ['/api/budget'],
  });

  // Query user progress
  const { data: userProgress } = useQuery({
    queryKey: ['/api/user-progress'],
  });

  // Calculate progress percentage
  const completedTasks = tasks.filter((task: any) => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  // Format package name
  const packageName = user?.package 
    ? user.package.charAt(0).toUpperCase() + user.package.slice(1)
    : '';

  // Generate a unique invite link
  const inviteLink = `https://sehra.app/invite/${user?.uniqueId || ''}`;

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied",
      description: "Invite link copied to clipboard",
    });
  };

  // Features based on package
  const packageFeatures = {
    silver: [
      'Basic coordination services',
      'Standard venue selection',
      'Basic decoration package',
      'Up to 300 guests management',
      'Basic catering options',
    ],
    gold: [
      'Premium coordination services',
      'Premium venue selection',
      'Enhanced decoration package',
      'Up to 500 guests management',
      'Premium catering options',
      'Photography & videography',
      'Wedding website',
    ],
    platinum: [
      'Luxury coordination services',
      'Exclusive venue selection',
      'Luxury decoration package',
      'Unlimited guests management',
      'Premium catering with custom menu',
      'Photography & videography (extended package)',
      'Wedding website with custom domain',
      'Honeymoon planning assistance',
      'Celebrity entertainment options',
    ],
  };

  // Default checklist items
  const checklistItems = [
    { id: 1, title: 'Book venue', completed: completedTasks > 0 },
    { id: 2, title: 'Select catering', completed: completedTasks > 2 },
    { id: 3, title: 'Book photographer', completed: completedTasks > 4 },
    { id: 4, title: 'Order invitations', completed: completedTasks > 6 },
    { id: 5, title: 'Book entertainment', completed: completedTasks > 8 },
    { id: 6, title: 'Finalize guest list', completed: completedTasks > 10 },
  ];

  return (
    <motion.div
      variants={staggerContainer()}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Wedding Date & Countdown */}
      <WeddingDateBanner />
      
      {/* Top Row */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={fadeIn('up', 'tween', 0.2, 0.5)}
      >
        {/* Wedding Package Overview */}
        <Card className="border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#800000] text-xl flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5" />
              {packageName} Package
            </CardTitle>
            <CardDescription>Your selected wedding package</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {packageName && packageFeatures[packageName.toLowerCase() as keyof typeof packageFeatures]?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Wedding Progress */}
        <Card className="border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#800000] text-xl flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Wedding Progress
            </CardTitle>
            <CardDescription>Track your planning progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Budget Utilization</span>
                  <span className="text-sm font-medium">
                    {budgetItems.length > 0 
                      ? Math.round((budgetItems.filter((item: any) => item.status === 'paid').length / budgetItems.length) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={budgetItems.length > 0 
                    ? Math.round((budgetItems.filter((item: any) => item.status === 'paid').length / budgetItems.length) * 100)
                    : 0} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Guest Responses</span>
                  <span className="text-sm font-medium">
                    {userProgress?.guestResponseRate || 0}%
                  </span>
                </div>
                <Progress value={userProgress?.guestResponseRate || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Supervisor Info */}
        <SupervisorCard />
      </motion.div>
      
      {/* Middle Row */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={fadeIn('up', 'tween', 0.3, 0.5)}
      >
        {/* Wedding Checklist */}
        <Card className="border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#800000] text-xl flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Wedding Checklist
            </CardTitle>
            <CardDescription>Key planning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={`item-${item.id}`} 
                    checked={item.completed}
                    onCheckedChange={() => {
                      // This would be connected to the task updating API in a real implementation
                      toast({
                        title: item.completed ? "Task Uncompleted" : "Task Completed",
                        description: item.completed ? "Task marked as incomplete" : "Task completed and XP awarded!",
                        variant: item.completed ? "default" : "success"
                      });
                    }}
                    className={item.completed ? "bg-[#800000] border-[#800000]" : ""}
                  />
                  <label
                    htmlFor={`item-${item.id}`}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      item.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {item.title}
                  </label>
                  {item.completed && (
                    <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      +10 XP
                    </span>
                  )}
                </div>
              ))}
              <Button variant="link" className="text-[#800000] hover:text-[#5c0000] p-0 h-auto mt-2">
                View all tasks
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Budget Overview */}
        <Card className="border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#800000] text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Budget Overview
            </CardTitle>
            <CardDescription>Track your wedding expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Total Budget</div>
                  <div className="text-lg font-semibold text-gray-800">
                    ₹{userProgress?.totalBudget?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Spent</div>
                  <div className="text-lg font-semibold text-gray-800">
                    ₹{userProgress?.spentBudget?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Budget Used</span>
                  <span className="text-sm font-medium">
                    {userProgress?.budgetHealth ? `${userProgress.budgetHealth}%` : '0%'}
                  </span>
                </div>
                <Progress value={userProgress?.budgetHealth || 0} className="h-2" />
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Budget Mood</h4>
                <div className="flex items-center gap-2">
                  {['Worried', 'Cautious', 'On Track', 'Happy'].map((mood, i) => (
                    <div 
                      key={i} 
                      className={`text-xs px-2 py-1 rounded-full flex-1 text-center ${
                        i === Math.floor((userProgress?.budgetMood || 0) / 25)
                          ? 'bg-[#800000] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {mood}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button variant="link" className="text-[#800000] hover:text-[#5c0000] p-0 h-auto">
                View budget details
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Bottom Row */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={fadeIn('up', 'tween', 0.4, 0.5)}
      >
        {/* Wedding Style Board */}
        <Card className="border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#800000] text-xl flex items-center">
              <FileImage className="mr-2 h-5 w-5" />
              Wedding Style Board
            </CardTitle>
            <CardDescription>Visualize your wedding style</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-[#FFC0CB]/20 rounded-md flex items-center justify-center">
                <Camera className="h-8 w-8 text-[#FFC0CB]" />
              </div>
              <div className="aspect-square bg-[#FFC0CB]/20 rounded-md flex items-center justify-center">
                <Camera className="h-8 w-8 text-[#FFC0CB]" />
              </div>
              <div className="aspect-square bg-[#FFC0CB]/20 rounded-md flex items-center justify-center">
                <Camera className="h-8 w-8 text-[#FFC0CB]" />
              </div>
              <div className="aspect-square bg-[#FFC0CB]/20 rounded-md flex items-center justify-center">
                <Camera className="h-8 w-8 text-[#FFC0CB]" />
              </div>
            </div>
            <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4 bg-[#FFC0CB] text-[#800000] hover:bg-[#FFC0CB]/80">
                  <Upload className="h-4 w-4 mr-2" />
                  Add Inspiration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Inspiration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Drag and drop an image, or click to browse</p>
                  </div>
                  <div>
                    <Label htmlFor="styleDescription">Description (optional)</Label>
                    <Textarea id="styleDescription" placeholder="Add notes about this style element" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUploadDialog(false)}>Cancel</Button>
                  <Button className="bg-[#800000] hover:bg-[#5c0000]">Upload</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        {/* Invitation Management */}
        <Card className="border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#800000] text-xl flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Invitation Management
            </CardTitle>
            <CardDescription>Manage your wedding invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-[#800000]/5 rounded-lg p-3 text-sm">
                <div className="font-medium mb-1">Share your wedding details</div>
                <div className="text-gray-600 mb-3">
                  Create a unique link for guests to view your wedding details and RSVP
                </div>
                <div className="flex">
                  <Input value={inviteLink} readOnly className="text-xs" />
                  <Button 
                    size="sm" 
                    onClick={copyInviteLink}
                    className="ml-2 bg-[#800000] hover:bg-[#5c0000]"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-[#800000] hover:bg-[#5c0000]">
                    <FileImage className="h-4 w-4 mr-2" />
                    Upload Invitation Design
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Invitation Design</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Drag and drop your invitation design, or click to browse</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialog(false)}>Cancel</Button>
                    <Button className="bg-[#800000] hover:bg-[#5c0000]">Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share via WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Important Reminders */}
        <Card className="border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#800000] text-xl flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Important Reminders
            </CardTitle>
            <CardDescription>Upcoming deadlines and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.filter((task: any) => !task.completed).slice(0, 3).map((task: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-[#800000]/5">
                  <Calendar className="h-5 w-5 text-[#800000] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{task.title || 'Upcoming Task'}</div>
                    <div className="text-xs text-gray-500">
                      {task.dueDate 
                        ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          }) 
                        : 'No due date'}
                    </div>
                  </div>
                </div>
              ))}
              
              {tasks.filter((task: any) => !task.completed).length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">All caught up! No pending tasks.</p>
                </div>
              )}
              
              <Button variant="link" className="text-[#800000] hover:text-[#5c0000] p-0 h-auto w-full text-center">
                View all reminders
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default MyWeddingSection;