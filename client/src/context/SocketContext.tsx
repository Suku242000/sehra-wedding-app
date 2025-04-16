import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import socketService from '@/lib/socketService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@shared/schema';

interface SocketContextType {
  isConnected: boolean;
  isAuthenticated: boolean;
  messages: Message[];
  unreadCount: number;
  sendMessage: (toUserId: number, message: string, type?: string) => void;
  markAsRead: (fromUserId: number) => void;
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
    if (user && user.id) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
        setIsAuthenticated(true);
      }
    } else {
      socketService.disconnect();
      setIsAuthenticated(false);
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // Socket event listeners
  useEffect(() => {
    // Handle connection events
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Socket connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    const handleError = (error: any) => {
      console.error('Socket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to real-time service',
        variant: 'destructive',
      });
    };

    const handleNewMessage = (message: Message) => {
      if (message && user) {
        setMessages((prev) => [...prev, message]);
        
        // Only increment unread count if the message is to the current user and not from them
        if (message.toUserId === user.id && message.fromUserId !== user.id) {
          setUnreadCount((prev) => prev + 1);
          
          // Show toast notification for new message
          toast({
            title: 'New Message',
            description: message.content.substring(0, 60) + (message.content.length > 60 ? '...' : ''),
          });
        }
      }
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('error', handleError);
    socketService.on('receive_message', handleNewMessage);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('error', handleError);
      socketService.off('receive_message', handleNewMessage);
    };
  }, [toast, user]);

  const sendMessage = (toUserId: number, message: string, type = 'text') => {
    if (!isConnected || !user) {
      toast({
        title: 'Connection Error',
        description: 'Not connected to the messaging service',
        variant: 'destructive',
      });
      return;
    }
    
    socketService.emit('send_message', {
      toUserId,
      content: message,
      messageType: type
    });
  };

  const markAsRead = (fromUserId: number) => {
    if (!isConnected || !user) return;
    
    socketService.emit('mark_read', fromUserId);
    
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

  const value = {
    isConnected,
    isAuthenticated,
    messages,
    unreadCount,
    sendMessage,
    markAsRead,
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