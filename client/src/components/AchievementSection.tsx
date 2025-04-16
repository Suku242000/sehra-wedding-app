import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy,
  Medal,
  Calendar,
  Users,
  CreditCard,
  Store,
  CheckCircle,
  Clock,
  User,
  Calendar as CalendarIcon,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';

// Map category to icon
const categoryIcons = {
  Planning: <Calendar className="h-5 w-5" />,
  Budget: <CreditCard className="h-5 w-5" />,
  Vendors: <Store className="h-5 w-5" />,
  Engagement: <Sparkles className="h-5 w-5" />,
  Profile: <User className="h-5 w-5" />
};

export function AchievementSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  
  // Query to fetch all achievements
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['/api/achievements'],
    queryFn: undefined,
    enabled: !!user
  });

  // Query to fetch user achievements
  const { data: userAchievements, isLoading: isLoadingUserAchievements } = useQuery({
    queryKey: ['/api/user-achievements'],
    queryFn: undefined,
    enabled: !!user
  });

  // Query to fetch user progress
  const { data: userProgress, isLoading: isLoadingUserProgress } = useQuery({
    queryKey: ['/api/user-progress'],
    queryFn: undefined,
    enabled: !!user
  });

  const isLoading = isLoadingAchievements || isLoadingUserAchievements || isLoadingUserProgress;

  // Calculate total achievements earned
  const totalEarned = userAchievements?.length || 0;
  const totalAchievements = achievements?.length || 0;
  const completionPercentage = totalAchievements > 0 ? Math.round((totalEarned / totalAchievements) * 100) : 0;

  // Group achievements by category
  const achievementsByCategory = achievements?.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, any[]>) || {};

  // Check if user has earned an achievement
  const hasEarned = (achievementId: number) => {
    return userAchievements?.some(ua => ua.achievementId === achievementId) || false;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
        <h3 className="mt-4 text-lg font-semibold">Loading Achievements...</h3>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Achievements
          </h2>
          <p className="text-muted-foreground mt-1">
            Track your progress and earn badges as you plan your perfect wedding
          </p>
        </div>
        
        <Card className="w-full md:w-auto bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold">{totalEarned}</span>
                <span className="text-sm text-muted-foreground">Earned</span>
              </div>
              
              <div className="h-8 w-px bg-border hidden md:block"></div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{completionPercentage}% Complete</span>
                  <span className="text-xs text-muted-foreground">({totalEarned}/{totalAchievements})</span>
                </div>
                <Progress value={completionPercentage} className="h-2 w-[180px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full md:w-auto">
            <TabsTrigger value="all" className="px-3">All</TabsTrigger>
            {Object.keys(achievementsByCategory).map(category => (
              <TabsTrigger key={category} value={category} className="px-3 flex items-center gap-1">
                {categoryIcons[category as keyof typeof categoryIcons]}
                <span className="hidden md:inline">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Earned</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-gray-300"></div>
              <span className="text-sm">Locked</span>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements?.map((achievement) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                earned={hasEarned(achievement.id)} 
              />
            ))}
          </div>
        </TabsContent>

        {Object.keys(achievementsByCategory).map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementsByCategory[category].map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  earned={hasEarned(achievement.id)} 
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface AchievementCardProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    category: string;
    points: number;
    badge_url: string;
    criteria: string;
  };
  earned: boolean;
}

const AchievementCard = ({ achievement, earned }: AchievementCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border overflow-hidden transition-all ${earned ? 'bg-primary/5 border-primary/20' : 'opacity-80'}`}>
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <Badge variant={earned ? "default" : "outline"} className={earned ? "bg-green-500 hover:bg-green-600" : ""}>
              {earned ? 'Earned' : 'Locked'}
            </Badge>
            <span className="flex items-center text-amber-500 font-semibold">
              <Trophy className="h-4 w-4 mr-1" />
              {achievement.points} pts
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className={`h-12 w-12 flex items-center justify-center rounded-full ${earned ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {categoryIcons[achievement.category as keyof typeof categoryIcons] || <Medal className="h-6 w-6" />}
            </div>
            <div>
              <CardTitle className="text-lg">{achievement.name}</CardTitle>
              <CardDescription className="text-xs flex items-center mt-1">
                <span className="text-muted-foreground">{achievement.category}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>{achievement.criteria}</span>
        </CardFooter>
        
        {earned && (
          <div className="h-1.5 bg-gradient-to-r from-green-400 to-primary"></div>
        )}
      </Card>
    </motion.div>
  );
};