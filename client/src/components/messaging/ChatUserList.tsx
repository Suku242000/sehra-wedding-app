import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import socketService from '@/lib/socketService';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  Users,
  Store,
  UserPlus,
  Bell,
  Mail,
  Loader2
} from 'lucide-react';
import { User, Message } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

interface ChatUserListProps {
  onUserSelect: (userId: number) => void;
  selectedUserId: number | null;
}

interface ChatUser extends User {
  unreadCount: number;
  lastMessage?: Message;
}

const ChatUserList: React.FC<ChatUserListProps> = ({ onUserSelect, selectedUserId }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  
  // Fetch all users to chat with based on role
  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/chat/users'],
    queryFn: () => fetchWithAuth('/api/chat/users'),
    enabled: !!user,
  });
  
  // Fetch unread message counts
  const { data: unreadCounts = {}, refetch: refetchUnreadCounts } = useQuery<Record<string, number>>({
    queryKey: ['/api/messages/unread/count'],
    queryFn: () => fetchWithAuth('/api/messages/unread/count'),
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });
  
  // Get last messages with each user
  const { data: lastMessages = {}, refetch: refetchLastMessages } = useQuery<Record<string, Message>>({
    queryKey: ['/api/messages/last'],
    queryFn: () => fetchWithAuth('/api/messages/last'),
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });
  
  // Listen for new messages to update counts and last messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.toUserId === user?.id) {
        refetchUnreadCounts();
        refetchLastMessages();
      }
    };
    
    socketService.on('newMessage', handleNewMessage);
    
    return () => {
      socketService.off('newMessage', handleNewMessage);
    };
  }, [user?.id, refetchUnreadCounts, refetchLastMessages]);
  
  // Combine user data with unread counts and last messages
  const usersWithMetadata: ChatUser[] = allUsers.map(u => ({
    ...u,
    unreadCount: unreadCounts[u.id.toString()] || 0,
    lastMessage: lastMessages[u.id.toString()]
  }));
  
  // Filter users based on search term and role
  const filteredUsers = usersWithMetadata.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'recent') {
      // Show users with recent messages first
      return u.lastMessage && matchesSearch;
    } else if (activeTab === 'vendors') {
      return u.role === 'VENDOR' && matchesSearch;
    } else if (activeTab === 'clients') {
      return (u.role === 'BRIDE' || u.role === 'GROOM' || u.role === 'FAMILY') && matchesSearch;
    } else if (activeTab === 'supervisors') {
      return u.role === 'SUPERVISOR' && matchesSearch;
    }
    
    return matchesSearch;
  });
  
  // Sort users - first by unread count, then by last message time
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // First sort by unread count (descending)
    if (a.unreadCount !== b.unreadCount) {
      return b.unreadCount - a.unreadCount;
    }
    
    // Then sort by last message time (descending)
    const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    
    return bTime - aTime;
  });
  
  // Get user's initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Format last message time
  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search messages..."
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="recent" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 px-2 mb-2">
          <TabsTrigger value="recent" className="text-xs flex flex-col items-center py-1 data-[state=active]:text-[#800000]">
            <Mail className="h-4 w-4 mb-1" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="vendors" className="text-xs flex flex-col items-center py-1 data-[state=active]:text-[#800000]">
            <Store className="h-4 w-4 mb-1" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="clients" className="text-xs flex flex-col items-center py-1 data-[state=active]:text-[#800000]">
            <Users className="h-4 w-4 mb-1" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="supervisors" className="text-xs flex flex-col items-center py-1 data-[state=active]:text-[#800000]">
            <UserPlus className="h-4 w-4 mb-1" />
            Supervisors
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="mt-0 flex-1 overflow-y-auto">
          <UserList
            users={sortedUsers}
            isLoading={isLoadingUsers}
            onUserSelect={onUserSelect}
            selectedUserId={selectedUserId}
            emptyMessage="No recent conversations"
          />
        </TabsContent>
        
        <TabsContent value="vendors" className="mt-0 flex-1 overflow-y-auto">
          <UserList
            users={sortedUsers}
            isLoading={isLoadingUsers}
            onUserSelect={onUserSelect}
            selectedUserId={selectedUserId}
            emptyMessage="No vendors available"
          />
        </TabsContent>
        
        <TabsContent value="clients" className="mt-0 flex-1 overflow-y-auto">
          <UserList
            users={sortedUsers}
            isLoading={isLoadingUsers}
            onUserSelect={onUserSelect}
            selectedUserId={selectedUserId}
            emptyMessage="No clients found"
          />
        </TabsContent>
        
        <TabsContent value="supervisors" className="mt-0 flex-1 overflow-y-auto">
          <UserList
            users={sortedUsers}
            isLoading={isLoadingUsers}
            onUserSelect={onUserSelect}
            selectedUserId={selectedUserId}
            emptyMessage="No supervisors available"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface UserListProps {
  users: ChatUser[];
  isLoading: boolean;
  onUserSelect: (userId: number) => void;
  selectedUserId: number | null;
  emptyMessage: string;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  isLoading, 
  onUserSelect, 
  selectedUserId,
  emptyMessage
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#800000]" />
        <p className="mt-2 text-sm text-gray-500">Loading users...</p>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
          <Users className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };
  
  return (
    <div className="divide-y">
      {users.map(user => (
        <div 
          key={user.id}
          className={`p-3 flex items-start hover:bg-gray-50 cursor-pointer transition-colors ${
            selectedUserId === user.id ? 'bg-gray-50' : ''
          }`}
          onClick={() => onUserSelect(user.id)}
        >
          <div className="relative">
            <Avatar className="h-10 w-10 border bg-[#800000]/10">
              <AvatarFallback className="text-[#800000]">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {user.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#800000] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {user.unreadCount}
              </div>
            )}
          </div>
          
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="font-medium truncate">{user.name}</div>
              {user.lastMessage && (
                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                  {user.lastMessage.createdAt ? formatDistanceToNow(new Date(user.lastMessage.createdAt.toString()), { addSuffix: true }) : ''}
                </span>
              )}
            </div>
            
            <div className="flex items-center">
              <div className="text-xs text-gray-500 truncate max-w-[190px]">
                <Badge variant="outline" className="mr-1 px-1 text-[10px]">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                </Badge>
                {user.lastMessage?.content || user.email}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatUserList;