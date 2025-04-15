import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchWithAuth, createWithAuth, updateWithAuth, invalidateQueries } from '@/lib/api';
import { User, UserRole, Task } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { fadeIn, itemVariants } from '@/lib/motion';
import { formatDate, getInitials, calculateDaysLeft } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertTriangle, Calendar, Check, CheckCircle2, Clock, FileEdit, Mail, Package, Phone, PlusCircle, UserPlus } from 'lucide-react';

// Task form schema
const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().default('pending'),
  priority: z.string().default('medium'),
  userId: z.number(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const ClientList: React.FC = () => {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  
  // Fetch supervisor clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['/api/supervisor/clients'],
  });
  
  // Fetch tasks for all clients
  const { data: allTasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });
  
  // Task form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      status: 'pending',
      priority: 'medium',
      userId: 0,
    },
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: TaskFormValues) => createWithAuth('/api/tasks', taskData),
    onSuccess: () => {
      invalidateQueries('/api/tasks');
      toast({ 
        title: "Task Created", 
        description: "Task has been assigned to the client successfully." 
      });
      form.reset();
      setOpenTaskDialog(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Task Assignment Failed", 
        description: error.message || "Failed to assign task.", 
        variant: "destructive" 
      });
    }
  });

  // Open task assignment dialog
  const openAssignTaskDialog = (client: User) => {
    setSelectedClient(client);
    form.reset({
      title: '',
      description: '',
      dueDate: '',
      status: 'pending',
      priority: 'medium',
      userId: client.id,
    });
    setOpenTaskDialog(true);
  };
  
  // Handle task form submission
  const onSubmit = (data: TaskFormValues) => {
    createTaskMutation.mutate(data);
  };
  
  // Get tasks for a client
  const getClientTasks = (clientId: number) => {
    return allTasks.filter((task: Task) => task.userId === clientId);
  };
  
  // Calculate client progress
  const getClientProgress = (clientId: number) => {
    const tasks = getClientTasks(clientId);
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter((task: Task) => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };
  
  // Get color based on days left
  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 7) return 'text-red-600';
    if (daysLeft <= 30) return 'text-amber-600';
    return 'text-green-600';
  };
  
  // Get package badge color
  const getPackageBadgeColor = (packageType: string | null) => {
    switch (packageType) {
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'gold': return 'bg-yellow-50 text-amber-800 border-[#FFD700]';
      case 'platinum': return 'bg-slate-100 text-slate-800 border-slate-300';
      default: return 'bg-gray-100 text-gray-400 border-gray-200';
    }
  };
  
  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.BRIDE: return 'bg-[#FFC0CB] text-[#800000] hover:bg-[#FFC0CB]/80';
      case UserRole.GROOM: return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case UserRole.FAMILY: return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <motion.div
      variants={fadeIn('up', 'tween', 0.2, 0.5)}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-serif font-semibold text-[#800000]">My Clients</h2>
        <p className="text-gray-600">Manage and track your assigned wedding clients.</p>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Clients Assigned</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You don't have any clients assigned to you yet. The admin will assign clients to you soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Client Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {clients.map((client: User) => {
              const progress = getClientProgress(client.id);
              const daysLeft = client.weddingDate ? calculateDaysLeft(client.weddingDate) : 0;
              const clientTasks = getClientTasks(client.id);
              const completedTasks = clientTasks.filter((task: Task) => task.status === 'completed').length;
              
              return (
                <motion.div
                  key={client.id}
                  variants={itemVariants}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col border-[#FFD700]/20 hover:border-[#FFD700] transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3 bg-[#FFC0CB]/20 text-[#800000]">
                            <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-[#800000]">{client.name}</CardTitle>
                            <CardDescription>
                              <Badge className={getRoleBadgeColor(client.role)}>
                                {client.role.charAt(0).toUpperCase() + client.role.slice(1)}
                              </Badge>
                              {client.package && (
                                <Badge className={`ml-2 ${getPackageBadgeColor(client.package)}`}>
                                  {client.package.charAt(0).toUpperCase() + client.package.slice(1)}
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Wedding Date:</span>
                          <span className="font-medium">
                            {client.weddingDate ? formatDate(client.weddingDate) : 'Not set'}
                          </span>
                        </div>
                        {client.weddingDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Days Left:</span>
                            <span className={`font-medium ${getDaysLeftColor(daysLeft)}`}>
                              {daysLeft} days
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tasks Progress:</span>
                          <span className="font-medium">{completedTasks}/{clientTasks.length} tasks</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progress:</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#800000]" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#800000]" />
                          <span>Contact Phone (not stored)</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Button
                        variant="outline"
                        className="w-1/2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
                        onClick={() => openAssignTaskDialog(client)}
                      >
                        <PlusCircle className="mr-1 h-4 w-4" /> Assign Task
                      </Button>
                      <Button
                        variant="outline"
                        className="w-1/2 ml-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
                      >
                        <Calendar className="mr-1 h-4 w-4" /> Schedule Call
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          
          {/* Detailed Client Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Client Tasks Overview</CardTitle>
              <CardDescription>Monitor and manage tasks for all your clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {clients.map((client: User) => {
                  const clientTasks = getClientTasks(client.id);
                  
                  return (
                    <AccordionItem key={client.id} value={`client-${client.id}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2 bg-[#FFC0CB]/20 text-[#800000]">
                            <AvatarFallback className="text-xs">{getInitials(client.name)}</AvatarFallback>
                          </Avatar>
                          <span>{client.name}</span>
                          <Badge className="ml-2">
                            {clientTasks.filter((t: Task) => t.status === 'completed').length}/{clientTasks.length} Tasks
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {clientTasks.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <p>No tasks assigned to this client yet.</p>
                            <Button 
                              variant="link" 
                              className="text-[#800000]"
                              onClick={() => openAssignTaskDialog(client)}
                            >
                              <PlusCircle className="mr-1 h-4 w-4" /> Assign a task
                            </Button>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Task</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clientTasks.map((task: Task) => (
                                <TableRow key={task.id}>
                                  <TableCell className="font-medium">{task.title}</TableCell>
                                  <TableCell>
                                    {task.dueDate ? (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        {formatDate(task.dueDate)}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">No due date</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        task.priority === 'high'
                                          ? 'bg-red-100 text-red-800'
                                          : task.priority === 'medium'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-green-100 text-green-800'
                                      }
                                    >
                                      {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Medium'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(task.status)}
                                      <span>
                                        {task.status === 'completed'
                                          ? 'Completed'
                                          : task.status === 'pending'
                                          ? 'Pending'
                                          : 'In Progress'}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#800000]">
                                        <FileEdit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600">
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Assign Task Dialog */}
      <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Task to {selectedClient?.name}</DialogTitle>
            <DialogDescription>
              Create a new task for this client. They will see it on their dashboard.
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
                      <Textarea placeholder="Describe what needs to be done" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Button type="button" variant="outline" onClick={() => setOpenTaskDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="maroon-gradient">
                  Assign Task
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ClientList;
