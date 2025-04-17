import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  fetchWithAuth, 
  createWithAuth, 
  updateWithAuth, 
  deleteWithAuth, 
  invalidateQueries 
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
  Plus,
  Filter,
  CheckCheck,
  Clock8 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import confetti from 'canvas-confetti';

const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().default('pending'),
  priority: z.string().default('medium'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const TaskManager: React.FC = () => {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [progressPercent, setProgressPercent] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Fetch tasks with auth
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: () => fetchWithAuth('/api/tasks'),
    enabled: true,
  });
  
  // Form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      status: 'pending',
      priority: 'medium',
    },
  });
  
  // Calculate task completion status and progress
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const completedTasks = tasks.filter((task: Task) => task.status === 'completed').length;
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
    if (filterStatus === "completed") return task.status === "completed";
    if (filterStatus === "pending") return task.status === "pending";
    return true;
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
      description: "You've completed all your tasks!",
      variant: "default",
    });
    
    // Reset celebration state after animation
    setTimeout(() => {
      setShowCelebration(false);
    }, 4000);
  };
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (newTask: TaskFormValues) => createWithAuth('/api/tasks', newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ 
        title: "Task Created", 
        description: "Your task has been created successfully." 
      });
      form.reset();
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create task.", 
        variant: "destructive" 
      });
    }
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => 
      updateWithAuth(`/api/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task Updated", description: "Task has been updated successfully." });
      form.reset();
      setEditingTask(null);
      setOpenDialog(false);
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
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete task.", 
        variant: "destructive" 
      });
    }
  });
  
  // Handle status toggle
  const handleStatusToggle = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    // Optimistic update for smoother UI experience
    const optimisticTasks = [...tasks];
    const taskIndex = optimisticTasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      optimisticTasks[taskIndex] = { ...task, status: newStatus };
      queryClient.setQueryData(['/api/tasks'], optimisticTasks);
    }
    
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: newStatus }
    }, {
      onError: () => {
        // Revert optimistic update if the mutation fails
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      }
    });
    
    // Check if this completion will complete all tasks, and trigger celebration
    if (newStatus === 'completed') {
      const pendingTasksCount = tasks.filter(t => t.status === 'pending' && t.id !== task.id).length;
      if (pendingTasksCount === 0) {
        // Slight delay to let the update complete first
        setTimeout(() => {
          triggerCelebration();
        }, 300);
      }
    }
  };
  
  // Handle delete
  const handleDelete = (id: number) => {
    deleteTaskMutation.mutate(id);
  };
  
  // Handle edit
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      status: task.status,
      priority: task.priority || 'medium',
    });
    setOpenDialog(true);
  };
  
  // Handle form submission
  const onSubmit = (data: TaskFormValues) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    } else {
      createTaskMutation.mutate(data);
    }
  };
  
  // Close dialog and reset form
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    form.reset();
  };
  
  // Get status badge
  const getStatusBadge = (task: Task) => {
    if (task.status === 'completed') {
      return <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</div>;
    } else if (task.priority === 'high') {
      return <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Urgent</div>;
    } else if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        return <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded flex items-center"><Clock className="w-3 h-3 mr-1" /> Overdue</div>;
      } else if (diffDays <= 7) {
        return <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center"><Clock className="w-3 h-3 mr-1" /> Due in {diffDays} days</div>;
      }
    }
    
    return <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center"><Clock className="w-3 h-3 mr-1" /> In progress</div>;
  };
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-2"
      variants={fadeIn('up', 'tween', 0.2, 0.5)}
      initial="hidden"
      animate="show"
    >
      <div className="bg-[#800000] py-3 px-4 border-b border-[#5c0000]">
        <h2 className="text-white font-medium">Task Manager</h2>
      </div>
      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-1 items-center">
            <div className="text-sm font-medium">Task Progress</div>
            <div className="text-sm text-gray-600">{progressPercent}% Complete</div>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                progressPercent === 100 
                  ? 'bg-green-600' 
                  : progressPercent > 66 
                  ? 'bg-[#800000]' 
                  : progressPercent > 33 
                  ? 'bg-amber-500' 
                  : 'bg-red-500'
              }`}
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex mb-4 gap-2">
          <div className="flex items-center bg-white border rounded-md">
            <Button 
              size="sm" 
              variant={filterStatus === "all" ? "default" : "ghost"}
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 rounded-none ${filterStatus === "all" ? 'bg-[#800000] text-white' : 'text-gray-600'}`}
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" /> All
            </Button>
            <Button 
              size="sm" 
              variant={filterStatus === "pending" ? "default" : "ghost"}
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1 rounded-none ${filterStatus === "pending" ? 'bg-[#800000] text-white' : 'text-gray-600'}`}
            >
              <Clock8 className="w-3.5 h-3.5 mr-1.5" /> Pending
            </Button>
            <Button 
              size="sm" 
              variant={filterStatus === "completed" ? "default" : "ghost"}
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1 rounded-none ${filterStatus === "completed" ? 'bg-[#800000] text-white' : 'text-gray-600'}`}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> Completed
            </Button>
          </div>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <div className="flex mb-4 gap-2">
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingTask(null);
                  form.reset({
                    title: '',
                    description: '',
                    dueDate: '',
                    status: 'pending',
                    priority: 'medium',
                  });
                }}
                className="maroon-gradient flex-1"
              >
                <Plus className="w-4 h-4 mr-2" /> Add New Task
              </Button>
            </DialogTrigger>
          </div>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
              <DialogDescription>
                {editingTask ? 'Edit the details of your task below.' : 'Fill in the details of your new task.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your task" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" className="maroon-gradient">
                    {editingTask ? 'Update Task' : 'Add Task'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center p-3 border border-gray-100 rounded bg-gray-50 h-[48px]"></div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No tasks yet. Add your first task to get started!</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No {filterStatus} tasks found.</p>
            </div>
          ) : (
            <motion.div 
              variants={fadeIn('up', 'tween', 0.2, 0.5)}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {filteredTasks.map((task: Task) => (
                <motion.div 
                  key={task.id}
                  variants={itemVariants}
                  className={`flex items-center justify-between p-2 border ${
                    task.status === 'completed' 
                      ? 'border-gray-100 rounded bg-[#F5F5F5]' 
                      : task.priority === 'high'
                      ? 'border-red-200 rounded bg-red-50'
                      : 'border-gray-100 rounded bg-white'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <Checkbox 
                      checked={task.status === 'completed'} 
                      onCheckedChange={() => handleStatusToggle(task)}
                      className="mr-2 data-[state=checked]:bg-[#800000] data-[state=checked]:text-white border-2 h-5 w-5 rounded transition-all duration-200 data-[state=checked]:scale-105"
                    />
                    <span className={`ml-2 flex-1 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(task)}
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(task)}
                        className="text-[#800000] hover:text-[#5c0000] hover:bg-[#FFC0CB]/10 p-1 h-7 w-7"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(task.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-7 w-7"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskManager;
