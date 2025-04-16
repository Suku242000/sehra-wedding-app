import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';
import { format } from 'date-fns';
import { 
  Award,
  TrendingUp,
  CheckCircle,
  Calendar,
  CreditCard,
  Users,
  ChevronUp,
  Flame,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
import { apiRequest, queryClient } from "@/lib/queryClient";

const moodColorMap = {
  'stressed': '#ef4444', // Red
  'concerned': '#f97316', // Orange 
  'neutral': '#a3a3a3', // Gray
  'good': '#22c55e', // Green
  'excellent': '#10b981', // Emerald
};

const moodEmojis = {
  'stressed': '😰',
  'concerned': '😟',
  'neutral': '😐',
  'good': '😊',
  'excellent': '😁',
};

export function ProgressTracker() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();
  
  // Query to fetch user progress
  const { data: userProgress, isLoading } = useQuery({
    queryKey: ['/api/user-progress'],
    queryFn: undefined,
    enabled: !!user
  });

  // Query to fetch tasks
  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: undefined,
    enabled: !!user
  });

  // Query to fetch budget items
  const { data: budgetItems } = useQuery({
    queryKey: ['/api/budget'],
    queryFn: undefined,
    enabled: !!user
  });

  // Mutation to update user progress
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: any) => {
      const res = await apiRequest('PATCH', '/api/user-progress', progressData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-progress'] });
    }
  });

  // Calculate budget health
  useEffect(() => {
    if (budgetItems && budgetItems.length > 0 && userProgress) {
      // Calculate the ratio of actual spending to estimated budget
      const totalEstimated = budgetItems.reduce((sum: number, item: any) => sum + (item.estimatedCost || 0), 0);
      const totalActual = budgetItems.reduce((sum: number, item: any) => sum + (item.actualCost || 0), 0);
      
      if (totalEstimated > 0) {
        const ratio = totalActual / totalEstimated;
        let budgetHealth = 100;
        let budgetMood = 'excellent';
        
        // Determine health and mood based on spending ratio
        if (ratio > 1.2) {
          budgetHealth = 40; // Significantly over budget
          budgetMood = 'stressed';
        } else if (ratio > 1.1) {
          budgetHealth = 60; // Somewhat over budget
          budgetMood = 'concerned';
        } else if (ratio > 0.9) {
          budgetHealth = 80; // On budget
          budgetMood = 'good';
        } else if (ratio > 0.7) {
          budgetHealth = 90; // Under budget
          budgetMood = 'excellent';
        }
        
        // Update budget health if it has changed
        if (budgetHealth !== userProgress.budgetHealth || budgetMood !== userProgress.budgetMood) {
          updateProgressMutation.mutate({
            budgetHealth,
            budgetMood
          });
        }
      }
    }
  }, [budgetItems, userProgress]);

  // Calculate checklist progress
  useEffect(() => {
    if (tasks && tasks.length > 0 && userProgress) {
      const completedTasks = tasks.filter((task: any) => task.completed).length;
      const totalTasks = tasks.length;
      const taskProgress = Math.round((completedTasks / totalTasks) * 100) || 0;
      
      if (taskProgress !== userProgress.checklistProgress || completedTasks !== userProgress.tasksCompleted) {
        updateProgressMutation.mutate({
          checklistProgress: taskProgress,
          tasksCompleted: completedTasks
        });
      }
    }
  }, [tasks, userProgress]);

  if (isLoading || !userProgress) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate level progress
  const currentLevel = userProgress.level;
  const pointsToNextLevel = currentLevel * 500; // Example formula: level * 500 points needed
  const currentPoints = userProgress.totalPoints || 0;
  const levelProgress = Math.min(Math.round((currentPoints / pointsToNextLevel) * 100), 100);

  // Mock data for progress chart - in a real app, you'd fetch this from an API
  const last30DaysData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: format(date, 'MMM d'),
      points: Math.floor(Math.random() * 100) + 50, // Random data for demo
    };
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Award className="h-8 w-8 text-primary" />
          Your Wedding Journey
        </h2>
        <p className="text-muted-foreground mt-1">
          Track your progress and level up as you plan your dream wedding
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Level</CardDescription>
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl">{currentLevel}</CardTitle>
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {currentPoints} points
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span>Progress to level {currentLevel + 1}</span>
                  <span>{levelProgress}%</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{pointsToNextLevel - currentPoints} points needed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Planning Streak</CardDescription>
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl">{userProgress.streak || 0} days</CardTitle>
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span>Next milestone</span>
                  <span>7 days</span>
                </div>
                <Progress value={(userProgress.streak || 0) * 100 / 7} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Last active: {format(new Date(userProgress.lastActive), 'MMM d, yyyy')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Checklist Progress</CardDescription>
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl">{userProgress.checklistProgress || 0}%</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <Progress value={userProgress.checklistProgress || 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{userProgress.tasksCompleted || 0} tasks completed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Budget Health</CardDescription>
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl flex items-center">
                  <span style={{ color: moodColorMap[userProgress.budgetMood as keyof typeof moodColorMap] || '#a3a3a3' }}>
                    {moodEmojis[userProgress.budgetMood as keyof typeof moodEmojis]}
                  </span>
                  <span className="ml-2">{userProgress.budgetHealth || 0}%</span>
                </CardTitle>
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <Progress 
                  value={userProgress.budgetHealth || 0} 
                  className="h-2" 
                  indicatorColor={moodColorMap[userProgress.budgetMood as keyof typeof moodColorMap]}
                />
                <p className="text-xs text-muted-foreground mt-1">Budget mood: {userProgress.budgetMood}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Your planning journey at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last30DaysData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="points" 
                      name="Activity Points"
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Planning Categories</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Timeline Events
                        </span>
                        <span>4/10</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Guest Management
                        </span>
                        <span>32/100</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" />
                          Budget Items
                        </span>
                        <span>12/20</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recent Milestones</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start p-2 rounded bg-primary/5">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Completed 10 tasks</p>
                        <p className="text-xs text-muted-foreground">Apr 12, 2025</p>
                      </div>
                    </li>
                    <li className="flex items-start p-2 rounded bg-primary/5">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Added first budget item</p>
                        <p className="text-xs text-muted-foreground">Apr 10, 2025</p>
                      </div>
                    </li>
                    <li className="flex items-start p-2 rounded bg-primary/5">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Set wedding date</p>
                        <p className="text-xs text-muted-foreground">Apr 5, 2025</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
              <CardDescription>Your wedding planning by the numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Planning Metrics
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Days since signup</span>
                        <span className="font-medium">32</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Days until wedding</span>
                        <span className="font-medium">245</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Planning time invested</span>
                        <span className="font-medium">18.5 hrs</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Points earned this week</span>
                        <span className="font-medium">175</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Checklist Status
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tasks completed</span>
                      <Badge variant="outline">{userProgress.tasksCompleted || 0}/20</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">High priority</span>
                      <Badge variant="outline">3/5</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Medium priority</span>
                      <Badge variant="outline">7/10</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Low priority</span>
                      <Badge variant="outline">2/5</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold flex items-center mb-2">
                    <Award className="h-4 w-4 mr-1" />
                    Achievements
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total unlocked</span>
                      <Badge variant="outline">4/10</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Planning badges</span>
                      <Badge variant="outline">2/4</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget badges</span>
                      <Badge variant="outline">1/2</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Engagement badges</span>
                      <Badge variant="outline">1/4</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your latest actions on Sehra</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* This is sample data - in a real app, fetch from API */}
                <ActivityItem 
                  icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                  title="Completed task: Book venue visit"
                  timestamp="Today at 2:45 PM"
                  points={25}
                />
                <ActivityItem 
                  icon={<Users className="h-5 w-5 text-blue-500" />}
                  title="Added 5 guests to the guest list"
                  timestamp="Today at 11:30 AM"
                  points={15}
                />
                <ActivityItem 
                  icon={<CreditCard className="h-5 w-5 text-purple-500" />}
                  title="Updated budget for catering"
                  timestamp="Yesterday at 4:20 PM"
                  points={10}
                />
                <ActivityItem 
                  icon={<Calendar className="h-5 w-5 text-red-500" />}
                  title="Created timeline event: Engagement Party"
                  timestamp="Yesterday at 2:15 PM"
                  points={20}
                />
                <ActivityItem 
                  icon={<Award className="h-5 w-5 text-yellow-500" />}
                  title="Unlocked achievement: Planning Streak"
                  timestamp="Apr 14, 2025"
                  points={100}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  timestamp: string;
  points: number;
}

function ActivityItem({ icon, title, timestamp, points }: ActivityItemProps) {
  return (
    <div className="flex items-start">
      <div className="mr-4">{icon}</div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{timestamp}</p>
      </div>
      <Badge variant="outline" className="flex items-center">
        <ChevronUp className="h-3 w-3 mr-1 text-green-500" />
        +{points} pts
      </Badge>
    </div>
  );
}