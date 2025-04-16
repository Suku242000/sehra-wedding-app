import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, itemVariants } from '@/lib/motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchWithAuth, createWithAuth, updateWithAuth, deleteWithAuth, invalidateQueries } from '@/lib/api';
import { Guest } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, User, Share2, Upload, Download, QrCode, UserPlus, Mail, UsersRound, MapPin, Filter, Search, FileText, ChevronDown, Calendar } from 'lucide-react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

const guestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  relationship: z.string().optional(),
  status: z.string().default('pending'),
  side: z.string().optional(),
  plusOnes: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional(),
  group: z.string().optional(),
  address: z.string().optional(),
  events: z.array(z.string()).optional(),
  mealPreference: z.string().optional(),
  transportationNeeded: z.boolean().optional(),
  accommodation: z.string().optional(),
  tableAssignment: z.string().optional(),
});

type GuestFormValues = z.infer<typeof guestSchema>;

const csvImportSchema = z.object({
  file: z.instanceof(File),
});

type CsvImportFormValues = z.infer<typeof csvImportSchema>;

const EnhancedGuestManagement: React.FC = () => {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [importDialog, setImportDialog] = useState(false);
  const [qrDialog, setQrDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteUrl, setInviteUrl] = useState('https://sehra.app/wedding/invite-xyz123');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  
  // Fetch guests
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['/api/guests'],
  });
  
  // Form for guests
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
      group: '',
      events: [],
      mealPreference: '',
      transportationNeeded: false,
      accommodation: '',
      tableAssignment: '',
    },
  });
  
  // Import form
  const importForm = useForm<CsvImportFormValues>({
    resolver: zodResolver(csvImportSchema),
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
  
  // Import guests mutation (mock implementation)
  const importGuestsMutation = useMutation({
    mutationFn: (file: File) => {
      // This would connect to a real API endpoint
      console.log('Importing file:', file.name);
      return Promise.resolve({ success: true, count: 15 });
    },
    onSuccess: () => {
      invalidateQueries('/api/guests');
      toast({ 
        title: "Guests Imported", 
        description: "15 guests have been imported successfully." 
      });
      importForm.reset();
      setImportDialog(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Import Failed", 
        description: error.message || "Failed to import guests.", 
        variant: "destructive" 
      });
    }
  });
  
  // Send invitations mutation (mock implementation)
  const sendInvitationsMutation = useMutation({
    mutationFn: (guestIds: number[]) => {
      // This would connect to a real API endpoint
      console.log('Sending invitations to guests:', guestIds);
      return Promise.resolve({ success: true, count: guestIds.length });
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: "Invitations Sent", 
        description: `${variables.length} invitations have been sent successfully.` 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to Send Invitations", 
        description: error.message || "Failed to send invitations.", 
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
      group: guest.group || '',
      events: guest.events || [],
      mealPreference: guest.mealPreference || '',
      transportationNeeded: guest.transportationNeeded || false,
      accommodation: guest.accommodation || '',
      tableAssignment: guest.tableAssignment || '',
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
  
  // Handle import submission
  const onImportSubmit = (data: CsvImportFormValues) => {
    importGuestsMutation.mutate(data.file);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGuest(null);
    form.reset();
  };
  
  // Copy invite link to clipboard
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link Copied",
      description: "Invitation link copied to clipboard",
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Declined</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
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
  
  // Filter guests based on tab and search
  const filteredGuests = guests.filter((guest: Guest) => {
    // Filter by tab
    if (activeTab !== 'all' && guest.status !== activeTab) {
      return false;
    }
    
    // Filter by search
    if (searchQuery && !guest.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      if (!(guest.email && guest.email.toLowerCase().includes(searchQuery.toLowerCase()))) {
        if (!(guest.phone && guest.phone.includes(searchQuery))) {
          return false;
        }
      }
    }
    
    // Filter by selected events
    if (selectedEvents.length > 0) {
      if (!guest.events || !guest.events.some(event => selectedEvents.includes(event))) {
        return false;
      }
    }
    
    return true;
  });
  
  // Get stats
  const stats = {
    total: guests.length,
    confirmed: guests.filter((g: Guest) => g.status === 'confirmed').length,
    declined: guests.filter((g: Guest) => g.status === 'declined').length,
    pending: guests.filter((g: Guest) => g.status === 'pending').length,
    plusOnes: guests.reduce((acc: number, g: Guest) => acc + (g.plusOnes || 0), 0),
    totalAttending: guests.filter((g: Guest) => g.status === 'confirmed').length + 
                    guests.filter((g: Guest) => g.status === 'confirmed')
                          .reduce((acc: number, g: Guest) => acc + (g.plusOnes || 0), 0),
  };
  
  // Group guests by category for charts
  const guestGroups = guests.reduce((acc: Record<string, number>, guest: Guest) => {
    const group = guest.group || 'Uncategorized';
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});
  
  // Sample event options
  const eventOptions = [
    { id: 'sangeet', label: 'Sangeet' },
    { id: 'mehendi', label: 'Mehendi' },
    { id: 'haldi', label: 'Haldi' },
    { id: 'wedding', label: 'Wedding Ceremony' },
    { id: 'reception', label: 'Reception' },
  ];
  
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        variants={fadeIn('up', 'tween', 0.2, 0.5)}
      >
        <div>
          <h2 className="text-2xl font-serif font-semibold text-[#800000]">Guest Management</h2>
          <p className="text-gray-600">Manage your wedding guest list and invitations</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={importDialog} onOpenChange={setImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Import Guests</DialogTitle>
              </DialogHeader>
              
              <Form {...importForm}>
                <form onSubmit={importForm.handleSubmit(onImportSubmit)} className="space-y-4">
                  <FormField
                    control={importForm.control}
                    name="file"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>CSV File</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">
                              Drag and drop a CSV file, or click to browse
                            </p>
                            <input 
                              type="file" 
                              accept=".csv" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              }}
                              className="hidden" 
                              id="csv-upload" 
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => document.getElementById('csv-upload')?.click()}
                            >
                              Select File
                            </Button>
                            {value && (
                              <p className="mt-2 text-sm font-medium text-green-600">
                                File selected: {(value as File).name}
                              </p>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <p className="text-sm text-gray-500">
                    CSV file should have columns: name, email, phone, relationship, status, side, plusOnes
                  </p>
                  
                  <DialogFooter className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setImportDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-[#800000] hover:bg-[#5c0000]"
                      disabled={!importForm.getValues().file}
                    >
                      Import Guests
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Button
            onClick={() => {
              // This would trigger a real CSV download in production
              toast({
                title: "Export Started",
                description: "Your guest list is being exported as CSV",
              });
            }}
            variant="outline"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Export
          </Button>
          
          <Dialog open={qrDialog} onOpenChange={setQrDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <QrCode className="h-4 w-4" />
                QR Codes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate QR Codes</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-500">
                  Generate QR codes for your guests to use for check-in at your wedding events.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Select Events</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {eventOptions.map(event => (
                      <label
                        key={event.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="rounded text-[#800000] focus:ring-[#800000]"
                          value={event.id}
                          checked={selectedEvents.includes(event.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEvents([...selectedEvents, event.id]);
                            } else {
                              setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                            }
                          }}
                        />
                        {event.label}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="text-center py-6">
                  <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm font-medium">Sample QR Code</p>
                  <p className="text-xs text-gray-500">Generated QR codes will include guest name and event details</p>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setQrDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#800000] hover:bg-[#5c0000]"
                  onClick={() => {
                    // This would generate QR codes in production
                    toast({
                      title: "QR Codes Generated",
                      description: `QR codes for ${selectedEvents.length} events have been generated.`,
                    });
                    setQrDialog(false);
                  }}
                  disabled={selectedEvents.length === 0}
                >
                  Generate QR Codes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
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
                    group: '',
                    events: [],
                    mealPreference: '',
                    transportationNeeded: false,
                    accommodation: '',
                    tableAssignment: '',
                  });
                }}
                className="bg-[#800000] hover:bg-[#5c0000] gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Guest
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingGuest ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter guest name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="side"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Side</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
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
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="family">Family</SelectItem>
                              <SelectItem value="friends">Friends</SelectItem>
                              <SelectItem value="colleagues">Colleagues</SelectItem>
                              <SelectItem value="relatives">Relatives</SelectItem>
                              <SelectItem value="neighbors">Neighbors</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mealPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meal Preference</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select meal preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="vegetarian">Vegetarian</SelectItem>
                              <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                              <SelectItem value="vegan">Vegan</SelectItem>
                              <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                              <SelectItem value="no-preference">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="events"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Events Attending</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {eventOptions.map(event => (
                            <label
                              key={event.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                className="rounded text-[#800000] focus:ring-[#800000]"
                                value={event.id}
                                checked={(field.value || []).includes(event.id)}
                                onChange={(e) => {
                                  const newEvents = e.target.checked
                                    ? [...(field.value || []), event.id]
                                    : (field.value || []).filter(id => id !== event.id);
                                  field.onChange(newEvents);
                                }}
                              />
                              {event.label}
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
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
                    <Button type="submit" className="bg-[#800000] hover:bg-[#5c0000]">
                      {editingGuest ? 'Update Guest' : 'Add Guest'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
      
      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={fadeIn('up', 'tween', 0.3, 0.5)}
      >
        <Card className="bg-white shadow-sm border-[#FFD700]/20">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Total Guests</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold">{stats.total}</span>
                <UsersRound className="h-5 w-5 text-[#800000]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border-[#FFD700]/20">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Confirmed</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold">{stats.confirmed}</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  {Math.round((stats.confirmed / (stats.total || 1)) * 100)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border-[#FFD700]/20">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Total Attending</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold">{stats.totalAttending}</span>
                <span className="text-xs text-gray-500">incl. +{stats.plusOnes}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border-[#FFD700]/20">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Pending RSVPs</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold">{stats.pending}</span>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                  {Math.round((stats.pending / (stats.total || 1)) * 100)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Invitation Card */}
      <motion.div 
        variants={fadeIn('up', 'tween', 0.4, 0.5)}
      >
        <Card className="bg-white shadow-sm border-[#FFD700]/20">
          <CardHeader>
            <CardTitle className="text-[#800000]">Invitation Management</CardTitle>
            <CardDescription>Generate and share a link for your guests to RSVP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <div className="flex">
                  <Input value={inviteUrl} readOnly className="rounded-r-none" />
                  <Button 
                    className="rounded-l-none" 
                    onClick={copyInviteLink}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This link allows your guests to RSVP and see your wedding details
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-2">
                <Button 
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white"
                  onClick={() => {
                    // This would open WhatsApp in production
                    window.open(`https://wa.me/?text=${encodeURIComponent(`You're invited to our wedding! RSVP here: ${inviteUrl}`)}`, '_blank');
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share via WhatsApp
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    // This would send invitations in production
                    const selectedIds = filteredGuests
                      .filter(g => !!g.email)
                      .map(g => g.id);
                    
                    if (selectedIds.length === 0) {
                      toast({
                        title: "No Valid Recipients",
                        description: "Please select guests with email addresses.",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    sendInvitationsMutation.mutate(selectedIds);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email Invitations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Guest List */}
      <motion.div 
        variants={fadeIn('up', 'tween', 0.5, 0.5)}
      >
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between md:items-center">
              <CardTitle className="text-[#800000]">Guest List</CardTitle>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search guests..." 
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Button variant="outline" className="sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="declined">Declined</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                <div className="border rounded-md overflow-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            Loading guest list...
                          </TableCell>
                        </TableRow>
                      ) : filteredGuests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            No guests found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredGuests.map((guest: Guest) => (
                          <TableRow key={guest.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#800000]/10 flex items-center justify-center text-xs text-[#800000] font-medium">
                                  {getInitials(guest.name)}
                                </div>
                                <div>
                                  <div className="font-medium">{guest.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {guest.plusOnes > 0 && `+${guest.plusOnes} guests`}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center gap-1">
                                  {guest.email && (
                                    <Mail className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span>{guest.email || ''}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {guest.relationship && (
                                    <User className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span>{guest.relationship || ''}</span>
                                  {guest.side && (
                                    <span className="text-xs text-gray-500">
                                      ({guest.side === 'bride' ? 'Bride' : guest.side === 'groom' ? 'Groom' : 'Both'}'s side)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              {getStatusBadge(guest.status)}
                            </TableCell>
                            
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
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
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-500 hover:text-gray-700 p-1 h-7 w-7"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        updateGuestMutation.mutate({
                                          id: guest.id,
                                          data: { status: 'confirmed' }
                                        });
                                      }}
                                    >
                                      Mark as Confirmed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        updateGuestMutation.mutate({
                                          id: guest.id,
                                          data: { status: 'pending' }
                                        });
                                      }}
                                    >
                                      Mark as Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        updateGuestMutation.mutate({
                                          id: guest.id,
                                          data: { status: 'declined' }
                                        });
                                      }}
                                    >
                                      Mark as Declined
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        if (guest.email) {
                                          sendInvitationsMutation.mutate([guest.id]);
                                        } else {
                                          toast({
                                            title: "No Email Address",
                                            description: "This guest doesn't have an email address.",
                                            variant: "destructive"
                                          });
                                        }
                                      }}
                                    >
                                      Send Invitation
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => setDeleteId(guest.id)}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <AlertDialog open={deleteId === guest.id} onOpenChange={(open) => !open && setDeleteId(null)}>
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
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredGuests.length > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Showing {filteredGuests.length} of {guests.length} guests
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedGuestManagement;