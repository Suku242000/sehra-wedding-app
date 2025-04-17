import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Calendar, Clock, ArrowUpDown, Filter, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

type Task = {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  createdAt: string;
};

const MobileChecklist: React.FC = () => {
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');
  const [dueDateInput, setDueDateInput] = useState('');
  const { toast } = useToast();

  // Fetch tasks
  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
      const res = await apiRequest('POST', '/api/tasks', newTaskData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task created",
        description: "Your task has been added to the checklist.",
      });
      resetTaskForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create task",
        description: error.message || "An error occurred while creating the task.",
        variant: "destructive"
      });
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await apiRequest('PATCH', `/api/tasks/${id}`, { completed });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update task",
        description: error.message || "An error occurred while updating the task.",
        variant: "destructive"
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task deleted",
        description: "The task has been removed from your checklist.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete task",
        description: error.message || "An error occurred while deleting the task.",
        variant: "destructive"
      });
    }
  });

  const handleAddTask = () => {
    if (!newTask.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a title for your task.",
        variant: "destructive"
      });
      return;
    }

    const taskData = {
      title: newTask,
      description: "",
      completed: false,
      dueDate: dueDateInput || undefined,
      priority: selectedPriority,
      category: 'wedding', // Default category
    };

    createTaskMutation.mutate(taskData);
  };

  const handleTaskToggle = (id: number, completed: boolean) => {
    updateTaskMutation.mutate({ id, completed: !completed });
  };

  const handleDeleteTask = (id: number) => {
    deleteTaskMutation.mutate(id);
  };

  const resetTaskForm = () => {
    setNewTask('');
    setDueDateInput('');
    setSelectedPriority('medium');
    setIsAddingTask(false);
  };

  // Smart prioritization: Sort tasks based on due date, priority, and completion status
  const sortedAndFilteredTasks = React.useMemo(() => {
    let filteredTasks = [...tasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description?.toLowerCase().includes(query))
      );
    }

    // Apply completion filter
    if (filter === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (filter === 'pending') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    // Apply sorting
    return filteredTasks.sort((a, b) => {
      // Always show incomplete tasks first within the current filter
      if (filter === 'all' && a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      } else {
        // Sort by created date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [tasks, filter, searchQuery, sortBy]);

  // Calculate progress percentage
  const completionPercentage = tasks.length > 0 
    ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) 
    : 0;

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Check if a task is overdue
  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dueDate);
    return taskDate < today && taskDate.getTime() !== today.getTime();
  };

  // Calculate urgency based on due date and priority
  const getUrgencyBadge = (task: Task) => {
    if (task.completed) return null;
    
    if (isOverdue(task.dueDate)) {
      return <Badge variant="destructive" className="ml-2">Overdue</Badge>;
    }
    
    if (task.priority === 'high') {
      return <Badge variant="outline" className="ml-2 border-red-500 text-red-500">Urgent</Badge>;
    }
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7 && diffDays > 0) {
        return <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-500">Soon</Badge>;
      }
    }
    
    return null;
  };

  return (
    <Card className="border shadow-md">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-serif text-rose-700">Wedding Checklist</CardTitle>
          <Badge variant="outline" className="font-semibold">
            {completionPercentage}% Complete
          </Badge>
        </div>
        <CardDescription>
          Organize and track your wedding planning tasks
        </CardDescription>
        
        <div className="flex mt-2 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setSortBy(prev => 
              prev === 'dueDate' ? 'priority' : prev === 'priority' ? 'created' : 'dueDate'
            )}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            {sortBy === 'dueDate' ? 'Due' : sortBy === 'priority' ? 'Priority' : 'New'}
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={filter} onValueChange={(value) => setFilter(value as any)} className="mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">To Do</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="pb-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-700"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            Error loading tasks. Please try again.
          </div>
        ) : (
          <>
            <ScrollArea className="h-[320px] pr-4">
              <AnimatePresence initial={false}>
                {sortedAndFilteredTasks.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    {searchQuery ? 'No matching tasks found' : 'No tasks yet. Add your first task!'}
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {sortedAndFilteredTasks.map((task) => (
                      <motion.li
                        key={task.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative flex items-start space-x-2 bg-white rounded-md border p-3 shadow-sm"
                      >
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={() => handleTaskToggle(task.id, task.completed)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor={`task-${task.id}`}
                              className={`font-medium cursor-pointer ${task.completed ? 'line-through text-gray-400' : ''}`}
                            >
                              {task.title}
                              {getUrgencyBadge(task)}
                            </label>
                            <button 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          {task.dueDate && (
                            <div className={`flex items-center text-xs mt-1 ${
                              isOverdue(task.dueDate) && !task.completed 
                                ? 'text-red-500' 
                                : 'text-gray-500'
                            }`}>
                              <Calendar size={12} className="mr-1" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                          <div className="flex mt-2 items-center space-x-2">
                            <div 
                              className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                            ></div>
                            <span className="text-xs capitalize text-gray-500">
                              {task.priority} priority
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </AnimatePresence>
            </ScrollArea>
            
            {isAddingTask ? (
              <div className="mt-4 border rounded-md p-3 bg-gray-50">
                <Input
                  placeholder="Task title..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="mb-2"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={dueDateInput}
                      onChange={(e) => setDueDateInput(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedPriority === 'low' ? 'default' : 'outline'}
                      className={selectedPriority === 'low' ? 'bg-green-500 hover:bg-green-600' : 'border-green-500 text-green-500'}
                      onClick={() => setSelectedPriority('low')}
                    >
                      Low
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedPriority === 'medium' ? 'default' : 'outline'}
                      className={selectedPriority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : 'border-yellow-500 text-yellow-500'}
                      onClick={() => setSelectedPriority('medium')}
                    >
                      Med
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedPriority === 'high' ? 'default' : 'outline'}
                      className={selectedPriority === 'high' ? 'bg-red-500 hover:bg-red-600' : 'border-red-500 text-red-500'}
                      onClick={() => setSelectedPriority('high')}
                    >
                      High
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={resetTaskForm}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleAddTask}
                    disabled={createTaskMutation.isPending}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                className="w-full mt-4 bg-rose-600 hover:bg-rose-700"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus size={16} className="mr-1" /> Add New Task
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileChecklist;