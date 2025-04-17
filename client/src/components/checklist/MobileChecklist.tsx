import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  fetchWithAuth, 
  updateWithAuth, 
  deleteWithAuth 
} from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { Task } from '@shared/schema';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, itemVariants } from '@/lib/motion';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2,
  Check,
  Calendar,
  ClipboardList,
  Filter,
  PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import confetti from 'canvas-confetti';

const MobileChecklist: React.FC = () => {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [progressPercent, setProgressPercent] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Fetch tasks with auth
  const { data: tasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: () => fetchWithAuth('/api/tasks'),
    enabled: true,
    refetchInterval: 3000, // Auto-refresh every 3 seconds
    refetchOnWindowFocus: true, // Also refresh when window gets focus
  });
  
  // Calculate task completion status and progress
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const completedTasks = tasks.filter((task: Task) => task.completed || task.status === 'completed').length;
      const newProgressPercent = Math.round((completedTasks / tasks.length) * 100);
      
      // If we just reached 100% completion, trigger celebration
      if (newProgressPercent === 100 && progressPercent !== 100) {
        triggerCelebration();
      }
      
      setProgressPercent(newProgressPercent);
    } else {
      setProgressPercent(0);
    }
  }, [tasks]);
  
  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task: Task) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "completed") return task.completed || task.status === "completed";
    if (filterStatus === "pending") return !task.completed && (!task.status || task.status === "pending");
    if (filterStatus === "in_progress") return !task.completed && task.status === "in_progress";
    return true;
  });
  
  // Prioritize tasks (high priority first, then by due date)
  const prioritizedTasks = [...filteredTasks].sort((a, b) => {
    // First by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by due date if both have due dates
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Tasks with due dates come before those without
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // Finally by title
    return a.title.localeCompare(b.title);
  });
  
  // Trigger confetti celebration
  const triggerCelebration = () => {
    setShowCelebration(true);
    
    // Trigger confetti animation
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    toast({
      title: "Congratulations! 🎉",
      description: "You've completed all your wedding planning tasks!",
      variant: "default",
    });
    
    // Reset celebration state after animation
    setTimeout(() => {
      setShowCelebration(false);
    }, 4000);
  };
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => 
      updateWithAuth(`/api/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task Updated", description: "Task has been updated successfully." });
      setSelectedTask(null);
      setShowDetails(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update task.", 
        variant: "destructive" 
      });
    }
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteWithAuth(`/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task Deleted", description: "Task has been deleted successfully." });
      setSelectedTask(null);
      setShowDetails(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete task.", 
        variant: "destructive" 
      });
    }
  });
  
  // Handle status toggle from checkbox
  const handleStatusToggle = (task: Task) => {
    // If already completed, set to in_progress
    // If not completed, set to completed
    const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    
    // First, update the local state immediately for a smooth UI transition
    const optimisticTasks = tasks.map(t => 
      t.id === task.id ? { ...t, status: newStatus } : t
    );
    
    // Set the optimistic data to avoid flicker
    queryClient.setQueryData(['/api/tasks'], optimisticTasks);
    
    // Then send the update to the server
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        
        // Show a toast notification of the status change
        toast({
          title: `Task ${newStatus === 'completed' ? 'Completed' : 'In Progress'}`,
          description: `Task "${task.title}" has been marked as ${newStatus === 'completed' ? 'completed' : 'in progress'}.`,
          duration: 2000
        });
        
        // Celebration logic for task completion
        if (newStatus === 'completed') {
          const pendingTasksCount = optimisticTasks.filter(t => t.status !== 'completed').length;
          if (pendingTasksCount === 0) {
            // Slight delay to let the update complete first
            setTimeout(() => {
              triggerCelebration();
            }, 300);
          }
        }
      },
      onError: (error) => {
        console.error(`Failed to update task status: ${error.message}`);
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        toast({
          title: "Error",
          description: "Failed to update task status. Please try again.",
          variant: "destructive"
        });
      }
    });
  };
  
  // Handle delete
  const handleDelete = (id: number) => {
    deleteTaskMutation.mutate(id);
  };
  
  // View task details
  const viewTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };
  
  // Get status icon
  const getStatusIcon = (status: string | null) => {
    switch(status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Medium</Badge>;
      case 'low':
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-IN', options);
  };
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden col-span-3"
      variants={fadeIn('up', 'tween', 0.2, 0.5)}
      initial="hidden"
      animate="show"
    >
      <div className="bg-[#800000] py-3 px-4 border-b border-[#5c0000] flex justify-between items-center">
        <h2 className="text-white font-medium flex items-center">
          <ClipboardList className="mr-2 h-5 w-5" /> 
          Wedding Planning Checklist
        </h2>
        <Button 
          size="sm"
          variant="outline"
          className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          onClick={() => window.location.href = '/tasks/new'}
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </div>
      
      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-1 items-center">
            <div className="text-sm font-medium">Wedding Readiness</div>
            <div className="text-sm text-gray-600">{progressPercent}% Complete</div>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-2.5" 
            indicatorClassName={
              progressPercent === 100 
                ? 'bg-green-600' 
                : progressPercent > 66 
                ? 'bg-[#800000]' 
                : progressPercent > 33 
                ? 'bg-amber-500' 
                : 'bg-red-500'
            }
          />
        </div>
        
        {/* Filter Tabs */}
        <div className="mb-4 flex overflow-x-auto pb-2 gap-2">
          <Button 
            size="sm" 
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            className={filterStatus === "all" ? 'bg-[#800000] text-white' : ''}
          >
            <Filter className="h-4 w-4 mr-1" /> All
          </Button>
          <Button 
            size="sm" 
            variant={filterStatus === "pending" ? "default" : "outline"}
            onClick={() => setFilterStatus("pending")}
            className={filterStatus === "pending" ? 'bg-[#800000] text-white' : ''}
          >
            <AlertTriangle className="h-4 w-4 mr-1" /> Not Started
          </Button>
          <Button 
            size="sm" 
            variant={filterStatus === "in_progress" ? "default" : "outline"}
            onClick={() => setFilterStatus("in_progress")}
            className={filterStatus === "in_progress" ? 'bg-[#800000] text-white' : ''}
          >
            <Clock className="h-4 w-4 mr-1" /> In Progress
          </Button>
          <Button 
            size="sm" 
            variant={filterStatus === "completed" ? "default" : "outline"}
            onClick={() => setFilterStatus("completed")}
            className={filterStatus === "completed" ? 'bg-[#800000] text-white' : ''}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Completed
          </Button>
        </div>
        
        {/* Task List */}
        <div className="space-y-3">
          <AnimatePresence>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">
                <div className="animate-spin w-8 h-8 border-4 border-[#800000] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading your wedding planning tasks...</p>
              </div>
            ) : prioritizedTasks.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="mb-2">No tasks found</p>
                <Button 
                  size="sm"
                  variant="default"
                  className="bg-[#800000] hover:bg-[#600000]"
                  onClick={() => window.location.href = '/tasks/new'}
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Add Your First Task
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {prioritizedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className={`py-3 flex items-start gap-3 ${
                      task.status === 'completed' ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => viewTaskDetails(task)}
                  >
                    <div 
                      className="mt-0.5" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusToggle(task);
                      }}
                    >
                      <Checkbox 
                        checked={task.status === 'completed'}
                        className="border-2 data-[state=checked]:bg-[#800000] data-[state=checked]:border-[#800000]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium ${
                        task.status === 'completed' ? 'line-through text-gray-500' : ''
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        {task.dueDate && (
                          <div className="text-xs text-gray-600 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                        {task.priority && (
                          <div className="ml-auto">
                            {getPriorityBadge(task.priority)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusIcon(task.status)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Task Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {selectedTask?.status && (
                <div className="text-xs flex items-center">
                  {getStatusIcon(selectedTask.status)}
                  <span className="ml-1 capitalize">{selectedTask.status.replace('_', ' ')}</span>
                </div>
              )}
              {selectedTask?.priority && (
                <div className="ml-2">
                  {getPriorityBadge(selectedTask.priority)}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTask?.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-gray-600">{selectedTask.description}</p>
              </div>
            )}
            {selectedTask?.dueDate && (
              <div>
                <h4 className="text-sm font-medium mb-1">Due Date</h4>
                <p className="text-sm text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(selectedTask.dueDate)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              variant="destructive"
              size="sm"
              className="text-xs flex items-center"
              onClick={() => selectedTask && handleDelete(selectedTask.id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs"
                onClick={() => setShowDetails(false)}
              >
                Close
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs flex items-center bg-[#800000] hover:bg-[#600000]"
                onClick={() => selectedTask && handleStatusToggle(selectedTask)}
              >
                {selectedTask?.status === 'completed' ? (
                  <>
                    <Clock className="h-3.5 w-3.5 mr-1" /> Mark In Progress
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" /> Mark Complete
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default MobileChecklist;