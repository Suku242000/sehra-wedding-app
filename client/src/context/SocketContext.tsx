import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import socketService from '@/lib/socketService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  messageType: string;
  read: boolean;
  createdAt: Date;
  senderName?: string;
}

interface SocketContextType {
  isConnected: boolean;
  isAuthenticated: boolean;
  messages: Message[];
  unreadCount: number;
  sendMessage: (toUserId: number, message: string, type?: string) => void;
  markAsRead: (fromUserId: number) => void;
  notifySupervisorAllocation: (clientId: number, supervisorId: number) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Connect to socket when user logs in
  useEffect(() => {
    if (user) {
      socketService.authenticate(user);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // Socket event listeners
  useEffect(() => {
    socketService.on.onConnect(() => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socketService.on.onDisconnect(() => {
      setIsConnected(false);
      setIsAuthenticated(false);
      console.log('Socket disconnected');
    });

    socketService.on.onAuthenticated((data) => {
      setIsAuthenticated(data.success);
      console.log('Socket authenticated:', data.success);
    });

    socketService.on.onAuthError((error) => {
      console.error('Socket authentication error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to authenticate socket connection',
        variant: 'destructive',
      });
    });

    socketService.on.onReceiveMessage((message) => {
      setMessages((prev) => [...prev, message]);
      setUnreadCount((prev) => prev + 1);
      
      // Show toast notification for new message
      toast({
        title: `New message from ${message.senderName}`,
        description: message.content.substring(0, 60) + (message.content.length > 60 ? '...' : ''),
      });
    });

    socketService.on.onMessageSent((data) => {
      if (!data.success) {
        toast({
          title: 'Message Error',
          description: 'Failed to send message',
          variant: 'destructive',
        });
      }
    });

    socketService.on.onSupervisorAssigned((data) => {
      toast({
        title: 'Supervisor Assigned',
        description: `${data.supervisorName} has been assigned as your wedding supervisor`,
      });
    });

    socketService.on.onClientAssigned((data) => {
      toast({
        title: 'New Client',
        description: `${data.clientName} has been assigned to you`,
      });
    });

    socketService.on.onError((error) => {
      console.error('Socket error:', error);
      toast({
        title: 'Connection Error',
        description: error,
        variant: 'destructive',
      });
    });
  }, [toast]);

  const sendMessage = (toUserId: number, message: string, type = 'text') => {
    socketService.sendMessage(toUserId, message, type);
  };

  const markAsRead = (fromUserId: number) => {
    socketService.markMessagesAsRead(fromUserId);
    
    // Update local state
    setMessages((prev) => 
      prev.map((msg) => 
        msg.fromUserId === fromUserId && !msg.read 
          ? { ...msg, read: true } 
          : msg
      )
    );
    
    // Update unread count
    const newUnreadCount = messages.filter(
      (msg) => msg.fromUserId !== fromUserId && !msg.read
    ).length;
    
    setUnreadCount(newUnreadCount);
  };

  const notifySupervisorAllocation = (clientId: number, supervisorId: number) => {
    socketService.notifySupervisorAllocation(clientId, supervisorId);
  };

  const value = {
    isConnected,
    isAuthenticated,
    messages,
    unreadCount,
    sendMessage,
    markAsRead,
    notifySupervisorAllocation,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};