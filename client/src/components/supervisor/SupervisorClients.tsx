import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { useToast } from '@/hooks/use-toast';
import ClientBudgetView from './ClientBudgetView';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  PieChart,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  role: string;
  package?: string;
  weddingDate?: string;
  contactStatus?: 'pending' | 'contacted' | 'in_progress' | 'active';
}

export default function SupervisorClients() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Fetch clients assigned to the supervisor
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/supervisor/clients'],
    queryFn: () => fetchWithAuth('/api/supervisor/clients'),
  });

  const getContactStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3" /> Active
        </Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> In Progress
        </Badge>;
      case 'contacted':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" /> Contacted
        </Badge>;
      default:
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Pending
        </Badge>;
    }
  };

  const handleViewBudget = (client: Client) => {
    setSelectedClient(client);
    setActiveTab('budget');
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeIn('up', 'tween')}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Supervisor Dashboard</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">My Clients</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2"
            disabled={!selectedClient}>
            <PieChart className="h-4 w-4" />
            <span className="hidden md:inline">Client Budget</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Client Tasks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>My Assigned Clients</CardTitle>
              <CardDescription>
                Manage and track all your assigned clients from one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <Card key={client.id} className="overflow-hidden border-l-4 border-l-primary">
                      <CardHeader className="pb-1">
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        <CardDescription className="line-clamp-1">{client.email}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <div>
                            <div className="text-sm font-medium">Package:</div>
                            <Badge variant="outline" className="capitalize">
                              {client.package || "Not Selected"}
                            </Badge>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Status:</div>
                            {getContactStatusBadge(client.contactStatus)}
                          </div>
                        </div>
                        
                        {client.weddingDate && (
                          <div>
                            <div className="text-sm font-medium">Wedding Date:</div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{format(new Date(client.weddingDate), 'PPP')}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toast({
                              title: "Feature coming soon",
                              description: "Client messaging is under development"
                            })}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" /> Message
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            className="gap-1"
                            onClick={() => handleViewBudget(client)}
                          >
                            <PieChart className="h-4 w-4" /> View Budget <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTitle>No clients assigned yet</AlertTitle>
                  <AlertDescription>
                    You don't have any clients assigned to you. Clients will appear here when they are assigned.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          {selectedClient ? (
            <ClientBudgetView 
              clientId={selectedClient.id} 
              clientName={selectedClient.name} 
            />
          ) : (
            <Alert>
              <AlertTitle>No client selected</AlertTitle>
              <AlertDescription>
                Please select a client from the clients list to view their budget information.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Client Tasks</CardTitle>
              <CardDescription>
                View and manage tasks for your assigned clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  Client task management features are coming soon to the supervisor dashboard.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}