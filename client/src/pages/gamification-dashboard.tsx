import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementSection } from '@/components/AchievementSection';
import { ProgressTracker } from '@/components/ProgressTracker';
import { TimelineCreator } from '@/components/TimelineCreator';
import { useAuth } from '@/context/AuthContext';

export default function GamificationDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('progress');

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Wedding Journey</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress, earn achievements, and create your wedding timeline
        </p>
      </div>

      <Tabs defaultValue="progress" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="progress" className="mt-0">
          <ProgressTracker />
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-0">
          <AchievementSection />
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-0">
          <TimelineCreator />
        </TabsContent>
      </Tabs>
    </div>
  );
}