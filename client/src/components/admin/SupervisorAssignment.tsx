import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  supervisor: number;
  client: number;
}

const SupervisorAssignment: React.FC = () => {
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch supervisors
  const { data: supervisors = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest<User[]>('GET', '/api/admin/users');
      return response.filter(user => user.role === UserRole.SUPERVISOR);
    }
  });
  
  // Fetch clients without supervisors
  const { data: unassignedClients = [] } = useQuery({
    queryKey: ['/api/admin/users/unassigned'],
    queryFn: async () => {
      const response = await apiRequest<User[]>('GET', '/api/admin/users');
      return response.filter(user => 
        (user.role === UserRole.BRIDE || user.role === UserRole.GROOM || user.role === UserRole.FAMILY) && 
        !user.supervisorId && 
        user.package
      );
    }
  });
  
  // Fetch all current assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ['/api/admin/assignments'],
    queryFn: async () => {
      const response = await apiRequest<User[]>('GET', '/api/admin/users');
      return response
        .filter(user => user.supervisorId)
        .map(user => ({
          client: user,
          supervisor: supervisors.find(s => s.id === user.supervisorId)
        }));
    }
  });
  
  // Assign supervisor mutation
  const assignSupervisorMutation = useMutation({
    mutationFn: (data: Assignment) => 
      apiRequest('PATCH', `/api/admin/users/${data.client}`, { supervisorId: data.supervisor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/unassigned'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/assignments'] });
      
      setSelectedClient('');
      setSelectedSupervisor('');
      
      toast({
        title: 'Assignment successful',
        description: 'Client has been assigned to the supervisor.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Assignment failed',
        description: error.message || 'Failed to assign supervisor.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle assignment
  const handleAssign = () => {
    if (!selectedSupervisor || !selectedClient) {
      toast({
        title: 'Missing information',
        description: 'Please select both a supervisor and a client.',
        variant: 'destructive',
      });
      return;
    }
    
    assignSupervisorMutation.mutate({
      supervisor: parseInt(selectedSupervisor),
      client: parseInt(selectedClient)
    });
  };
  
  return (
    <div>
      <Tabs defaultValue="assign">
        <TabsList className="mb-4">
          <TabsTrigger value="assign">Assign Supervisors</TabsTrigger>
          <TabsTrigger value="current">Current Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assign">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Supervisor</label>
                  <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.map((supervisor: any) => (
                        <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                          {supervisor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Select Client</label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedClients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name} ({client.package} package)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleAssign}
                  disabled={!selectedSupervisor || !selectedClient || assignSupervisorMutation.isPending}
                  className="w-full"
                >
                  {assignSupervisorMutation.isPending ? 'Assigning...' : 'Assign Supervisor'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="current">
          <div className="space-y-4">
            {assignments.length > 0 ? (
              assignments.map((assignment: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-2 md:mb-0">
                        <div className="text-sm text-gray-500">Client</div>
                        <div className="font-medium">{assignment.client.name}</div>
                        <div className="text-xs text-gray-400">{assignment.client.email}</div>
                      </div>
                      <div className="mb-2 md:mb-0">
                        <div className="text-sm text-gray-500">Package</div>
                        <div className="font-medium capitalize">{assignment.client.package}</div>
                      </div>
                      <div className="mb-2 md:mb-0">
                        <div className="text-sm text-gray-500">Wedding Date</div>
                        <div className="font-medium">
                          {assignment.client.weddingDate 
                            ? new Date(assignment.client.weddingDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Not set'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Supervisor</div>
                        <div className="font-medium">{assignment.supervisor?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{assignment.supervisor?.email || ''}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No current assignments
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisorAssignment;