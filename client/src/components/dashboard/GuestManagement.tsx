import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, itemVariants } from '@/lib/motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchWithAuth, createWithAuth, updateWithAuth, deleteWithAuth, invalidateQueries } from '@/lib/api';
import { Guest } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
} from "@/components/ui/alert-dialog";

const guestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  relationship: z.string().optional(),
  status: z.string().default('pending'),
  side: z.string().optional(),
  plusOnes: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional(),
});

type GuestFormValues = z.infer<typeof guestSchema>;

const GuestManagement: React.FC = () => {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Fetch guests
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['/api/guests'],
  });
  
  // Form
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      relationship: '',
      status: 'pending',
      side: '',
      plusOnes: 0,
      notes: '',
    },
  });
  
  // Create guest mutation
  const createGuestMutation = useMutation({
    mutationFn: (newGuest: GuestFormValues) => createWithAuth('/api/guests', newGuest),
    onSuccess: () => {
      invalidateQueries('/api/guests');
      toast({ 
        title: "Guest Added", 
        description: "Your guest has been added successfully." 
      });
      form.reset();
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add guest.", 
        variant: "destructive" 
      });
    }
  });
  
  // Update guest mutation
  const updateGuestMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Guest> }) => 
      updateWithAuth(`/api/guests/${id}`, data),
    onSuccess: () => {
      invalidateQueries('/api/guests');
      toast({ title: "Guest Updated", description: "Guest has been updated successfully." });
      form.reset();
      setEditingGuest(null);
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update guest.", 
        variant: "destructive" 
      });
    }
  });
  
  // Delete guest mutation
  const deleteGuestMutation = useMutation({
    mutationFn: (id: number) => deleteWithAuth(`/api/guests/${id}`),
    onSuccess: () => {
      invalidateQueries('/api/guests');
      toast({ title: "Guest Deleted", description: "Guest has been deleted successfully." });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete guest.", 
        variant: "destructive" 
      });
    }
  });
  
  // Handle edit
  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    form.reset({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      relationship: guest.relationship || '',
      status: guest.status,
      side: guest.side || '',
      plusOnes: guest.plusOnes || 0,
      notes: guest.notes || '',
    });
    setOpenDialog(true);
  };
  
  // Handle form submission
  const onSubmit = (data: GuestFormValues) => {
    if (editingGuest) {
      updateGuestMutation.mutate({ id: editingGuest.id, data });
    } else {
      createGuestMutation.mutate(data);
    }
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGuest(null);
    form.reset();
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmed</span>;
      case 'declined':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Declined</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-2"
      variants={fadeIn('up', 'tween', 0.5, 0.5)}
      initial="hidden"
      animate="show"
    >
      <div className="bg-[#800000] py-3 px-4 border-b border-[#5c0000] flex justify-between items-center">
        <h2 className="text-white font-medium">Guest Management</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingGuest(null);
                form.reset({
                  name: '',
                  email: '',
                  phone: '',
                  relationship: '',
                  status: 'pending',
                  side: '',
                  plusOnes: 0,
                  notes: '',
                });
              }}
              className="text-xs bg-[#FFD700]/90 hover:bg-[#FFD700] text-[#800000] px-2 py-1 rounded flex items-center"
              size="sm"
            >
              <PlusCircle className="w-3 h-3 mr-1" /> Add Guest
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingGuest ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter guest name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Cousin, Friend" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="side"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Side</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select side" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bride">Bride's Side</SelectItem>
                            <SelectItem value="groom">Groom's Side</SelectItem>
                            <SelectItem value="both">Both Sides</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plusOnes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plus Ones</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add notes about the guest" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" className="maroon-gradient">
                    {editingGuest ? 'Update Guest' : 'Add Guest'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    Loading guest list...
                  </td>
                </tr>
              ) : guests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    No guests added yet. Click the "Add Guest" button to get started.
                  </td>
                </tr>
              ) : (
                guests.slice(0, 3).map((guest: Guest) => (
                  <motion.tr 
                    key={guest.id} 
                    variants={itemVariants}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-[#800000]/10 flex items-center justify-center text-xs text-[#800000] font-medium">
                          {getInitials(guest.name)}
                        </div>
                        <div className="ml-2">{guest.name}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {guest.relationship || '-'} {guest.side ? `(${guest.side === 'bride' ? 'Bride' : guest.side === 'groom' ? 'Groom' : 'Both'}'s side)` : ''}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {guest.phone || guest.email || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getStatusBadge(guest.status)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                      <div className="flex space-x-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(guest)}
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
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-7 w-7"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Guest</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {guest.name} from your guest list? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => deleteGuestMutation.mutate(guest.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {guests.length > 3 && (
          <div className="mt-4 text-center">
            <Button variant="link" className="text-[#800000] hover:text-[#5c0000] text-sm font-medium">
              View All {guests.length} Guests
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GuestManagement;
