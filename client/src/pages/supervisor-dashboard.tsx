import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { User, Task } from '@shared/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlarmClockIcon, CalendarIcon, CheckIcon, ListTodoIcon, UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import VendorAssignment from '@/components/supervisor/VendorAssignment';

const SupervisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Fetch clients assigned to this supervisor
  const { data: clients = [] } = useQuery<User[]>({
    queryKey: ['/api/supervisor/clients'],
    enabled: !!user
  });

  // Find selected client
  const selectedClient = clients.find(client => client.id === selectedClientId) || null;

  // Fetch tasks for selected client
  const { data: clientTasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks', selectedClientId],
    enabled: !!selectedClientId
  });

  // Calculate progress for each client
  const getClientProgress = (clientId: number) => {
    if (!clientId) return 0;
    
    // In a real app, we would fetch this from the API
    // For now, we'll generate a random progress
    return Math.floor(Math.random() * 100);
  };

  // Handle client selection
  const handleSelectClient = (clientId: number) => {
    setSelectedClientId(clientId);
  };

  return (
    <Layout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="p-4 md:p-8"
      >
        <motion.div
          variants={fadeIn('up', 'tween', 0.2, 0.5)}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold mb-2">Supervisor Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}. Manage your assigned clients and their wedding preparations here.
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <span className="text-muted-foreground text-sm">Total Clients</span>
                <span className="text-3xl font-bold">{clients.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <span className="text-muted-foreground text-sm">Upcoming Weddings</span>
                <span className="text-3xl font-bold">
                  {clients.filter(client => client.weddingDate && new Date(client.weddingDate) > new Date()).length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <span className="text-muted-foreground text-sm">Pending Tasks</span>
                <span className="text-3xl font-bold">
                  {/* This would be calculated from all client tasks */}
                  {Math.floor(Math.random() * 20) + 5}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <span className="text-muted-foreground text-sm">To Contact Today</span>
                <span className="text-3xl font-bold">
                  {/* This would be calculated based on rules */}
                  {Math.floor(Math.random() * 3)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Client List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Your Clients</CardTitle>
              <CardDescription>Manage your assigned clients</CardDescription>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div 
                      key={client.id} 
                      className={`
                        flex items-center p-3 rounded-lg cursor-pointer
                        ${selectedClientId === client.id ? 'bg-[#800000]/10 border border-[#800000]/30' : 'hover:bg-gray-100'}
                      `}
                      onClick={() => handleSelectClient(client.id)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-[#800000] text-white">
                          {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {client.weddingDate 
                            ? new Date(client.weddingDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Date not set'}
                        </div>
                        <Progress 
                          value={getClientProgress(client.id)} 
                          className="h-1 mt-2" 
                        />
                      </div>
                      <div className="ml-2">
                        <Badge variant="outline" className="capitalize">
                          {client.package || 'No package'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No clients assigned yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Detail Section */}
          <Card className="md:col-span-2">
            {selectedClient ? (
              <>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedClient.name}</CardTitle>
                      <CardDescription>{selectedClient.email}</CardDescription>
                    </div>
                    <Badge className="capitalize">{selectedClient.package}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview">
                    <TabsList className="mb-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="tasks">Tasks</TabsTrigger>
                      <TabsTrigger value="vendors">Vendors</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Wedding Date</div>
                            <div className="font-medium">
                              {selectedClient.weddingDate 
                                ? new Date(selectedClient.weddingDate).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'Not set'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Days Remaining</div>
                            <div className="font-medium">
                              {selectedClient.weddingDate 
                                ? Math.max(0, Math.floor((new Date(selectedClient.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                                : 'N/A'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Role</div>
                            <div className="font-medium capitalize">
                              {selectedClient.role}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Member Since</div>
                            <div className="font-medium">
                              {selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-3">Progress Overview</h3>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1 text-sm">
                                <span>Overall Progress</span>
                                <span>{getClientProgress(selectedClient.id)}%</span>
                              </div>
                              <Progress value={getClientProgress(selectedClient.id)} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1 text-sm">
                                <span>Tasks Completed</span>
                                <span>
                                  {clientTasks.filter(task => task.status === 'completed').length} / {clientTasks.length}
                                </span>
                              </div>
                              <Progress 
                                value={clientTasks.length ? (clientTasks.filter(task => task.status === 'completed').length / clientTasks.length) * 100 : 0} 
                                className="h-2" 
                              />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1 text-sm">
                                <span>Vendors Booked</span>
                                <span>4 / 8</span>
                              </div>
                              <Progress value={50} className="h-2" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-3">Recent Activity</h3>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <div className="bg-[#800000]/10 p-2 rounded-full mr-3">
                                <CheckIcon className="h-4 w-4 text-[#800000]" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">Completed task "Book photographer"</div>
                                <div className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(Date.now() - 1000 * 60 * 60 * 2), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="bg-[#800000]/10 p-2 rounded-full mr-3">
                                <UserIcon className="h-4 w-4 text-[#800000]" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">Added 5 new guests to the list</div>
                                <div className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(Date.now() - 1000 * 60 * 60 * 12), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="bg-[#800000]/10 p-2 rounded-full mr-3">
                                <CalendarIcon className="h-4 w-4 text-[#800000]" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">Updated wedding date</div>
                                <div className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <Button variant="outline">Send Message</Button>
                          <Button>Schedule Call</Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tasks">
                      <div className="space-y-4">
                        {clientTasks.length > 0 ? (
                          clientTasks.map((task) => (
                            <div key={task.id} className="flex items-start border-b pb-4 last:border-0">
                              <div className={`p-2 rounded-full mr-3 ${
                                task.status === 'completed' 
                                  ? 'bg-green-100' 
                                  : task.priority === 'high' 
                                    ? 'bg-red-100' 
                                    : 'bg-blue-100'
                              }`}>
                                <CheckIcon className={`h-4 w-4 ${
                                  task.status === 'completed' 
                                    ? 'text-green-600' 
                                    : task.priority === 'high' 
                                      ? 'text-red-600' 
                                      : 'text-blue-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{task.title}</div>
                                  <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                                    {task.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                                {task.dueDate && (
                                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                                    <AlarmClockIcon className="h-3 w-3 mr-1" />
                                    Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No tasks available for this client
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="vendors">
                      {selectedClient ? (
                        <VendorAssignment client={selectedClient} />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Select a client to manage vendor assignments
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="timeline">
                      <div className="text-center py-8 text-gray-500">
                        Wedding timeline will appear here
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="text-gray-400 mb-4">
                  <UserIcon className="h-16 w-16" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Client Selected</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Select a client from the list to view their details and help manage their wedding preparations.
                </p>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </Layout>
  );
};

export default SupervisorDashboard;