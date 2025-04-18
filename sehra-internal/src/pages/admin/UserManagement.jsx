import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Layout from '@/components/Layout';
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Lock,
  Mail,
  RotateCcw,
  Filter,
  UserCog,
  ChevronDown,
  Check,
  X,
  RefreshCcw
} from 'lucide-react';

// Form schemas
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  role: z.enum(['supervisor', 'admin'], {
    required_error: 'Please select a role',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters'),
});

const editUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  role: z.enum(['supervisor', 'admin'], {
    required_error: 'Please select a role',
  }),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  status: z.boolean().default(true),
});

const changePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  sendResetEmail: z.boolean().default(false),
});

// API service functions
const API = {
  getUsers: async () => {
    const response = await axios.get('/api/admin/users');
    return response.data;
  },
  getUsersByRole: async (role) => {
    const response = await axios.get(`/api/admin/users/role/${role}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await axios.post('/api/admin/users/create', userData);
    return response.data;
  },
  updateUser: async ({ id, data }) => {
    const response = await axios.patch(`/api/admin/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await axios.delete(`/api/admin/users/${id}`);
    return response.data;
  },
  changePassword: async ({ id, data }) => {
    const response = await axios.patch(`/api/admin/users/${id}/password`, data);
    return response.data;
  },
  getActionLogs: async () => {
    const response = await axios.get('/api/admin/action-logs');
    return response.data;
  },
};

// Main component
const UserManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Create user form
  const createForm = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'supervisor',
      password: '',
      location: '',
    },
  });

  // Edit user form
  const editForm = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'supervisor',
      location: '',
      status: true,
    },
  });

  // Password change form
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: '',
      sendResetEmail: false,
    },
  });

  // Query to fetch all users
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: API.getUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    if (!usersQuery.data) return [];

    return usersQuery.data.filter((user) => {
      // Search filter
      const searchMatch =
        !searchTerm ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.uniqueId && user.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()));

      // Role filter
      const roleMatch = !roleFilter || user.role === roleFilter;

      // Location filter
      const locationMatch = !locationFilter || user.location === locationFilter;

      // Status filter
      const statusMatch =
        statusFilter === '' ||
        (statusFilter === 'active' && user.active) ||
        (statusFilter === 'inactive' && !user.active);

      return searchMatch && roleMatch && locationMatch && statusMatch;
    });
  }, [usersQuery.data, searchTerm, roleFilter, locationFilter, statusFilter]);

  // Query to fetch action logs
  const logsQuery = useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: API.getActionLogs,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: false, // Only load when tab is active
  });

  // Extract unique locations for filter
  const locations = useMemo(() => {
    if (!usersQuery.data) return [];
    
    const uniqueLocations = new Set();
    usersQuery.data.forEach(user => {
      if (user.location) {
        uniqueLocations.add(user.location);
      }
    });
    
    return Array.from(uniqueLocations);
  }, [usersQuery.data]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: API.createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'User created successfully',
        description: data.generatedPassword 
          ? `Password: ${data.generatedPassword} (copy before closing)` 
          : 'New user has been added to the system',
        variant: 'success',
      });
      setGeneratedPassword(data.generatedPassword || '');
      createForm.reset();
      setIsCreateModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to create user',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: API.updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'User updated successfully',
        description: 'User information has been updated',
        variant: 'success',
      });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to update user',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: API.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'User deleted successfully',
        description: 'User has been removed from the system',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete user',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: API.changePassword,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'Password updated successfully',
        description: data.newPassword 
          ? `New temporary password: ${data.newPassword} (copy before closing)` 
          : 'Password has been changed',
        variant: 'success',
      });
      setGeneratedPassword(data.newPassword || '');
      passwordForm.reset();
      setIsPasswordModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to change password',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handlers
  const handleCreateUser = (data) => {
    createUserMutation.mutate(data);
  };

  const handleUpdateUser = (data) => {
    if (!currentUser) return;
    updateUserMutation.mutate({ id: currentUser.id, data });
  };

  const handleDeleteUser = (id) => {
    deleteUserMutation.mutate(id);
  };

  const handleChangePassword = (data) => {
    if (!currentUser) return;
    changePasswordMutation.mutate({ id: currentUser.id, data });
  };

  // Open edit modal and populate form
  const openEditModal = (user) => {
    setCurrentUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location || '',
      status: user.active !== false, // Default to true if not specified
    });
    setIsEditModalOpen(true);
  };

  // Open password modal
  const openPasswordModal = (user) => {
    setCurrentUser(user);
    passwordForm.reset({
      password: '',
      sendResetEmail: false,
    });
    setIsPasswordModalOpen(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setLocationFilter('');
    setStatusFilter('');
  };

  return (
    <Layout>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-maroon-700">User Management</h1>
              <p className="text-gray-600">
                Manage admin and supervisor accounts for the Sehra wedding platform
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-maroon-700 hover:bg-maroon-800"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create New User
            </Button>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="users" className="px-6">Users</TabsTrigger>
              <TabsTrigger 
                value="logs" 
                className="px-6"
                onClick={() => logsQuery.refetch()}
              >
                Action Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle>User Directory</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <div className="relative flex-1 sm:max-w-[240px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[220px]">
                          <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <div className="p-2">
                            <Label className="text-xs font-medium">Role</Label>
                            <Select
                              value={roleFilter}
                              onValueChange={setRoleFilter}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="All Roles" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All Roles</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="p-2">
                            <Label className="text-xs font-medium">Location</Label>
                            <Select
                              value={locationFilter}
                              onValueChange={setLocationFilter}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="All Locations" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All Locations</SelectItem>
                                {locations.map(location => (
                                  <SelectItem key={location} value={location}>
                                    {location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="p-2">
                            <Label className="text-xs font-medium">Status</Label>
                            <Select
                              value={statusFilter}
                              onValueChange={setStatusFilter}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="All Statuses" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <DropdownMenuSeparator />
                          <div className="p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={clearFilters}
                            >
                              <RotateCcw className="mr-2 h-3 w-3" />
                              Clear Filters
                            </Button>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersQuery.isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-maroon-700 border-t-transparent rounded-full"></div>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm || roleFilter || locationFilter || statusFilter
                        ? "No users match your filters. Try different criteria."
                        : "No users found. Create a new user to get started."}
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[150px]">ID/Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-maroon-100 text-maroon-700">
                                      {user.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div>{user.name}</div>
                                    {user.uniqueId && (
                                      <div className="text-xs text-gray-500">{user.uniqueId}</div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600">{user.email}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.role === 'admin' ? 'destructive' : 'default'}
                                  className={
                                    user.role === 'admin'
                                      ? 'bg-maroon-100 text-maroon-700 hover:bg-maroon-200'
                                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  }
                                >
                                  {user.role === 'admin' ? 'Admin' : 'Supervisor'}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.location || 'Not set'}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.active !== false ? 'outline' : 'secondary'}
                                  className={
                                    user.active !== false
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }
                                >
                                  {user.active !== false ? (
                                    <Check className="mr-1 h-3 w-3" />
                                  ) : (
                                    <X className="mr-1 h-3 w-3" />
                                  )}
                                  {user.active !== false ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => openEditModal(user)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit user
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openPasswordModal(user)}>
                                      <Lock className="mr-2 h-4 w-4" />
                                      Change password
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          onSelect={(e) => e.preventDefault()}
                                          className="text-red-600"
                                        >
                                          <Trash className="mr-2 h-4 w-4" />
                                          Delete user
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the
                                            user account and remove their data from our servers.
                                            {user.role === 'supervisor' && (
                                              <p className="mt-2 text-amber-600">
                                                Warning: This user is a Supervisor. All their clients will be
                                                unassigned.
                                              </p>
                                            )}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>User Action Logs</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logsQuery.refetch()}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                  <CardDescription>
                    Track changes made to user accounts by administrators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {logsQuery.isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-maroon-700 border-t-transparent rounded-full"></div>
                    </div>
                  ) : !logsQuery.data || logsQuery.data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No action logs found. Actions will be recorded when changes are made.
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[200px]">Timestamp</TableHead>
                            <TableHead className="w-[150px]">Admin</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {logsQuery.data.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell>{log.adminName}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    log.action === 'CREATE_USER'
                                      ? 'bg-green-100 text-green-700 border-green-200'
                                      : log.action === 'UPDATE_USER'
                                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                                      : log.action === 'DELETE_USER'
                                      ? 'bg-red-100 text-red-700 border-red-200'
                                      : log.action === 'ASSIGN_SUPERVISOR'
                                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                                      : 'bg-amber-100 text-amber-700 border-amber-200'
                                  }
                                >
                                  {log.action.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-600">
                                  {log.details && typeof log.details === 'object' && (
                                    <>
                                      {log.details.email && <div>Email: {log.details.email}</div>}
                                      {log.details.role && <div>Role: {log.details.role}</div>}
                                      {log.details.userId && <div>User ID: {log.details.userId}</div>}
                                      {log.details.changes && (
                                        <div className="mt-1">
                                          Changes: {JSON.stringify(log.details.changes)}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new supervisor or admin user to the Sehra platform
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {field.value === 'supervisor' && (
                      <FormDescription>
                        Supervisors are assigned to clients and help manage their wedding planning
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      The city or region this user will be working from
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Leave empty to auto-generate" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      If left empty, a secure password will be generated
                    </FormDescription>
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="bg-maroon-700 hover:bg-maroon-800"
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          {generatedPassword && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <h4 className="text-sm font-medium text-amber-800 flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Generated Password
              </h4>
              <p className="mt-1 text-sm text-amber-700 font-mono">
                {generatedPassword}
              </p>
              <p className="mt-2 text-xs text-amber-600">
                Please copy this password now. It will not be shown again.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and status
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Inactive users cannot log in to the system
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="bg-maroon-700 hover:bg-maroon-800"
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password or send a password reset email
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="sendResetEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Send Password Reset</FormLabel>
                      <FormDescription>
                        Generate a temporary password and simulate sending it by email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {!passwordForm.watch('sendResetEmail') && (
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Password must be at least 6 characters
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="bg-maroon-700 hover:bg-maroon-800"
                >
                  {changePasswordMutation.isPending 
                    ? 'Processing...' 
                    : passwordForm.watch('sendResetEmail')
                      ? 'Send Reset Email'
                      : 'Change Password'
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
          {generatedPassword && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <h4 className="text-sm font-medium text-amber-800 flex items-center gap-2">
                <Key className="h-4 w-4" />
                Temporary Password
              </h4>
              <p className="mt-1 text-sm text-amber-700 font-mono">
                {generatedPassword}
              </p>
              <p className="mt-2 text-xs text-amber-600">
                Please copy this password now. It will not be shown again.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default UserManagement;