import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, VendorProfile } from '@shared/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CheckIcon, LinkIcon, UserPlusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface VendorAssignmentProps {
  client: User;
}

interface VendorWithProfile {
  id: number;
  name: string;
  email: string;
  uniqueId?: string;
  profile: VendorProfile | null;
}

const VendorAssignment: React.FC<VendorAssignmentProps> = ({ client }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available vendors
  const { data: vendors = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: isOpen,
    select: (data) => data.filter(user => user.role === 'vendor')
  });

  // Fetch assigned vendors for this client
  const { data: assignedVendors = [] } = useQuery<VendorWithProfile[]>({
    queryKey: ['/api/supervisor/assigned-vendors', client.id],
    enabled: !!client.id
  });

  // Initialize selected vendors when dialog opens
  useEffect(() => {
    if (client?.assignedVendors) {
      setSelectedVendorIds(Array.isArray(client.assignedVendors) ? client.assignedVendors : []);
    } else {
      setSelectedVendorIds([]);
    }
  }, [client, isOpen]);

  // Mutation to assign vendors
  const assignVendorsMutation = useMutation({
    mutationFn: async (vendorIds: number[]) => {
      const res = await apiRequest('POST', '/api/supervisor/assign-vendors', {
        clientId: client.id,
        vendorIds
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Vendors assigned',
        description: 'Vendors have been successfully assigned to the client.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/supervisor/assigned-vendors', client.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/supervisor/clients'] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to assign vendors',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Handle vendor selection
  const handleVendorSelection = (vendorId: string) => {
    const id = parseInt(vendorId);
    if (selectedVendorIds.includes(id)) {
      setSelectedVendorIds(selectedVendorIds.filter(v => v !== id));
    } else {
      setSelectedVendorIds([...selectedVendorIds, id]);
    }
  };

  // Handle assignment submission
  const handleAssignVendors = () => {
    assignVendorsMutation.mutate(selectedVendorIds);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assigned Vendors</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <UserPlusIcon className="h-4 w-4" />
              Assign Vendors
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Vendors to {client.name}</DialogTitle>
              <DialogDescription>
                Select vendors to assign to this client. They will be able to coordinate with the client directly.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 max-h-[300px] overflow-y-auto">
              <div className="space-y-2">
                {vendors.map(vendor => (
                  <div
                    key={vendor.id}
                    className={`
                      p-3 border rounded-md cursor-pointer flex items-center justify-between
                      ${selectedVendorIds.includes(vendor.id) ? 'bg-[#800000]/10 border-[#800000]/30' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => handleVendorSelection(vendor.id.toString())}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">{vendor.uniqueId || 'No ID'}</p>
                      </div>
                    </div>
                    {selectedVendorIds.includes(vendor.id) && (
                      <CheckIcon className="h-5 w-5 text-[#800000]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignVendors}
                disabled={assignVendorsMutation.isPending}
              >
                {assignVendorsMutation.isPending
                  ? 'Assigning...'
                  : 'Assign Vendors'
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {assignedVendors.length === 0 ? (
        <div className="p-6 text-center border border-dashed rounded-md bg-gray-50">
          <p className="text-muted-foreground">No vendors assigned yet</p>
          <Button
            variant="link"
            className="mt-2"
            onClick={() => setIsOpen(true)}
          >
            Assign vendors now
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {assignedVendors.map(vendor => (
            <Card key={vendor.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{vendor.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{vendor.uniqueId || 'No ID'}</span>
                        {vendor.profile && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="capitalize">
                              {vendor.profile.vendorType}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1"
                    onClick={() => {
                      // This would open a specific vendor contact/details view
                      // For now, we just show a toast
                      toast({
                        title: 'Contact vendor',
                        description: `Contact information for ${vendor.name}: ${vendor.email}`,
                      });
                    }}
                  >
                    <LinkIcon className="h-4 w-4" />
                    Contact
                  </Button>
                </div>
                
                {vendor.profile && (
                  <>
                    <Separator className="my-3" />
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Business: {vendor.profile.businessName}</p>
                      {vendor.profile.location && (
                        <p className="text-muted-foreground">Location: {vendor.profile.location}</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorAssignment;