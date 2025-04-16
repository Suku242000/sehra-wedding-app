import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { apiRequest, queryClient } from "@/lib/queryClient";

export function TimelineCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [color, setColor] = useState('#10b981'); // Default to emerald
  const [isMilestone, setIsMilestone] = useState(false);
  
  // Query to fetch timeline events
  const { data: timelineEvents = [], isLoading } = useQuery({
    queryKey: ['/api/timeline-events'],
    queryFn: undefined,
    enabled: !!user
  });

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Create mutation
  const createEventMutation = useMutation({
    mutationFn: async (newEvent: any) => {
      const res = await apiRequest('POST', '/api/timeline-events', newEvent);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-events'] });
      resetForm();
      setIsDialogOpen(false);
      toast({
        title: "Event created",
        description: "Your timeline event has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create event",
        description: error.message || "There was an error creating your event. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, eventData }: { id: number; eventData: any }) => {
      const res = await apiRequest('PATCH', `/api/timeline-events/${id}`, eventData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-events'] });
      resetForm();
      setIsDialogOpen(false);
      toast({
        title: "Event updated",
        description: "Your timeline event has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update event",
        description: error.message || "There was an error updating your event. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/timeline-events/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-events'] });
      toast({
        title: "Event deleted",
        description: "Your timeline event has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete event",
        description: error.message || "There was an error deleting your event. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Reorder mutation
  const reorderEventsMutation = useMutation({
    mutationFn: async (eventIds: number[]) => {
      const res = await apiRequest('POST', '/api/timeline-events/reorder', { eventIds });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-events'] });
      toast({
        title: "Timeline reordered",
        description: "Your timeline events have been reordered successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reorder timeline",
        description: error.message || "There was an error reordering your timeline. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Sort events by order
  const sortedEvents = [...(timelineEvents || [])].sort((a, b) => a.order - b.order);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle DnD end
  function handleDragEnd(event: any) {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = sortedEvents.findIndex(item => item.id === active.id);
      const newIndex = sortedEvents.findIndex(item => item.id === over.id);
      
      const newOrder = arrayMove(sortedEvents, oldIndex, newIndex);
      // Extract just the IDs in the new order
      const newOrderIds = newOrder.map(event => event.id);
      
      // Call the reorder mutation
      reorderEventsMutation.mutate(newOrderIds);
    }
  }

  // Reset form function
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(undefined);
    setLocation('');
    setColor('#10b981');
    setIsMilestone(false);
    setCurrentEvent(null);
    setIsEditing(false);
  };

  // Handle create/edit submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title and date for the event.",
        variant: "destructive",
      });
      return;
    }
    
    const eventData = {
      title,
      description: description || undefined,
      eventDate: format(date, 'yyyy-MM-dd'),
      location: location || undefined,
      color,
      isMilestone,
    };
    
    if (isEditing && currentEvent) {
      updateEventMutation.mutate({ id: currentEvent.id, eventData });
    } else {
      createEventMutation.mutate(eventData);
    }
  };

  // Handle edit click
  const handleEditClick = (event: any) => {
    setCurrentEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setDate(new Date(event.eventDate));
    setLocation(event.location || '');
    setColor(event.color || '#10b981');
    setIsMilestone(event.isMilestone || false);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Wedding Timeline
          </h2>
          <p className="text-muted-foreground mt-1">
            Create and organize events for your big day
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Event" : "Add New Event"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Update the details of your timeline event." 
                  : "Create a new event for your wedding timeline."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Ceremony, Reception, Rehearsal Dinner"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Grand Hyatt Hotel, Beach Resort"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any details or notes about this event"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="color">Color</Label>
                    <Select value={color} onValueChange={setColor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="flex items-center gap-2 p-1">
                          <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                          <SelectItem value="#10b981">Emerald</SelectItem>
                        </div>
                        <div className="flex items-center gap-2 p-1">
                          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                          <SelectItem value="#3b82f6">Blue</SelectItem>
                        </div>
                        <div className="flex items-center gap-2 p-1">
                          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                          <SelectItem value="#8b5cf6">Purple</SelectItem>
                        </div>
                        <div className="flex items-center gap-2 p-1">
                          <div className="w-4 h-4 rounded-full bg-pink-500"></div>
                          <SelectItem value="#ec4899">Pink</SelectItem>
                        </div>
                        <div className="flex items-center gap-2 p-1">
                          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                          <SelectItem value="#f59e0b">Amber</SelectItem>
                        </div>
                        <div className="flex items-center gap-2 p-1">
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                          <SelectItem value="#ef4444">Red</SelectItem>
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label className="mb-1">Milestone</Label>
                    <Select 
                      value={isMilestone ? "true" : "false"} 
                      onValueChange={(value) => setIsMilestone(value === "true")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Is this a milestone?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Event" : "Add Event"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Timeline Instructions</CardTitle>
          <CardDescription>
            Drag and drop events to reorder them and create your perfect wedding day schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 text-sm bg-muted/50 rounded-md">
          <div className="flex items-start gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">Create Events</p>
              <p className="text-muted-foreground">Add all important moments from your wedding day</p>
            </div>
          </div>
          <div className="h-px md:w-px md:h-auto bg-border flex-shrink-0"></div>
          <div className="flex items-start gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">Set Dates & Times</p>
              <p className="text-muted-foreground">Provide timing details for your schedule</p>
            </div>
          </div>
          <div className="h-px md:w-px md:h-auto bg-border flex-shrink-0"></div>
          <div className="flex items-start gap-2">
            <Edit className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">Reorder & Customize</p>
              <p className="text-muted-foreground">Drag events to reorder and highlight key moments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedEvents.length === 0 ? (
        <Card className="w-full text-center p-8">
          <div className="mb-4">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted" />
          </div>
          <h3 className="text-lg font-medium">No events yet</h3>
          <p className="text-muted-foreground mb-4">
            Start planning your wedding day by adding events to your timeline
          </p>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="mx-auto"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Event
          </Button>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-[25px] md:left-[120px] w-0.5 bg-primary/20 z-0"></div>
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={sortedEvents.map(event => event.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {sortedEvents.map((event) => (
                  <TimelineEvent 
                    key={event.id}
                    event={event}
                    onEdit={() => handleEditClick(event)}
                    onDelete={() => handleDeleteClick(event.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

interface TimelineEventProps {
  event: any;
  onEdit: () => void;
  onDelete: () => void;
}

function TimelineEvent({ event, onEdit, onDelete }: TimelineEventProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: event.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes}
      {...listeners}
      className="relative flex items-start gap-2 md:gap-8 cursor-move"
    >
      {/* Date (visible only on md+ screens) */}
      <div className="hidden md:block w-24 pt-1 text-right">
        <p className="text-sm font-medium">{formattedDate}</p>
      </div>
      
      {/* Timeline dot */}
      <div 
        className={cn(
          "flex-shrink-0 h-[26px] w-[26px] rounded-full border-4 z-10 mt-1",
          event.isMilestone 
            ? "border-primary bg-background" 
            : "border-background"
        )}
        style={{ 
          backgroundColor: event.isMilestone ? 'white' : event.color || '#10b981',
        }}
      ></div>
      
      {/* Event content */}
      <div className="flex-1">
        <Card className={cn(
          "transition-all group hover:shadow-md",
          event.isMilestone && "border-primary/50"
        )}>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  {/* Date (visible only on small screens) */}
                  <CalendarIcon className="h-3 w-3 mr-1 md:hidden" />
                  <span className="md:hidden">{formattedDate}</span>
                  
                  {/* Location */}
                  {event.location && (
                    <span className="flex items-center">
                      {event.location}
                    </span>
                  )}
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {event.description && (
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </CardContent>
          )}
          
          {/* Color indicator */}
          <div 
            className="h-1"
            style={{ backgroundColor: event.color || '#10b981' }}
          ></div>
        </Card>
      </div>
    </div>
  );
}