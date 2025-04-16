import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import socketService from '@/lib/socketService';
import ChatUserList from './ChatUserList';
import ChatInterface from './ChatInterface';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Message } from '@shared/schema';

// Define notification type if it's not exported from schema
interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date | string;
  type?: string;
}

const MessageCenter: React.FC = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMessageButton, setShowMessageButton] = useState(true);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  
  // Fetch total unread message count
  const { data: totalUnreadCount = 0, refetch: refetchUnreadCount } = useQuery<number>({
    queryKey: ['/api/messages/unread/total'],
    queryFn: () => fetchWithAuth('/api/messages/unread/total'),
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });
  
  // Fetch notifications
  const { data: notifications = [], refetch: refetchNotifications } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: () => fetchWithAuth('/api/notifications'),
    enabled: !!user,
    refetchInterval: 60000, // Check every minute
  });
  
  // Count unread notifications
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  
  // Listen for socket events
  useEffect(() => {
    // Handle new messages
    const handleNewMessage = (message: Message) => {
      if (message.toUserId === user?.id) {
        refetchUnreadCount();
        
        // If chat is not open with the sender, show a browser notification
        if (!isChatOpen || selectedUserId !== message.fromUserId) {
          showBrowserNotification('New Message', message.content);
        }
      }
    };
    
    // Handle message read status updated
    const handleReadStatusUpdated = () => {
      refetchUnreadCount();
    };
    
    // Handle new notification
    const handleNewNotification = (notification: Notification) => {
      refetchNotifications();
      showBrowserNotification(notification.title, notification.content);
    };
    
    socketService.on('receive_message', handleNewMessage);
    socketService.on('message_read', handleReadStatusUpdated);
    socketService.on('notification', handleNewNotification);
    
    return () => {
      socketService.off('receive_message', handleNewMessage);
      socketService.off('message_read', handleReadStatusUpdated);
      socketService.off('notification', handleNewNotification);
    };
  }, [user?.id, isChatOpen, selectedUserId, refetchUnreadCount, refetchNotifications]);
  
  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
  
  // Show browser notification
  const showBrowserNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      // Create notification
      new Notification(title, {
        body,
        icon: '/logo.png', // Update with your app's logo
      });
    }
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      refetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  
  // Format notification time
  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  // Handle user selection
  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    setIsChatOpen(true);
  };
  
  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setIsMinimized(false);
    }
  };
  
  // Toggle minimized state
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Close chat
  const closeChat = () => {
    setIsChatOpen(false);
    setShowMessageButton(true);
  };
  
  if (!user) return null;
  
  return (
    <>
      {/* Floating Message Button */}
      {showMessageButton && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={toggleChat}
            className="h-14 w-14 rounded-full bg-[#800000] hover:bg-[#600000] shadow-lg relative"
          >
            <MessageSquare className="h-6 w-6" />
            {totalUnreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 border-white border-2">
                {totalUnreadCount}
              </Badge>
            )}
          </Button>
        </div>
      )}
      
      {/* Notification Button */}
      <div className="fixed bottom-6 right-24 z-40">
        <Button
          onClick={() => setIsNotificationDialogOpen(true)}
          variant="outline"
          className="h-14 w-14 rounded-full bg-white shadow-lg relative border-[#800000] text-[#800000]"
        >
          <Bell className="h-6 w-6" />
          {unreadNotifications > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 border-white border-2 text-white">
              {unreadNotifications}
            </Badge>
          )}
        </Button>
      </div>
      
      {/* Notification Dialog */}
      <Dialog
        open={isNotificationDialogOpen}
        onOpenChange={setIsNotificationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                <Bell className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 ${!notification.isRead ? 'bg-gray-50' : ''}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-gray-500">
                        {notification.createdAt ? formatNotificationTime(notification.createdAt.toString()) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                    {!notification.isRead && (
                      <div className="flex justify-end mt-1">
                        <Badge variant="outline" className="text-xs bg-[#800000] text-white">
                          New
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Chat Panel */}
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`fixed z-50 bg-white shadow-xl rounded-t-lg overflow-hidden transition-all duration-300 ${
            isMinimized
              ? 'bottom-0 right-6 w-80 h-14'
              : 'bottom-0 right-6 w-[400px] h-[550px]'
          }`}
        >
          {/* Chat Header */}
          <div className="bg-[#800000] text-white p-3 flex justify-between items-center">
            <h3 className="font-medium text-sm">
              {isMinimized ? 'Chat' : selectedUserId ? 'Conversation' : 'Messages'}
              {totalUnreadCount > 0 && (
                <Badge className="ml-2 bg-white text-[#800000]">{totalUnreadCount}</Badge>
              )}
            </h3>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimized}
                className="h-7 w-7 p-0 text-white hover:bg-[#700000] rounded-full"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeChat}
                className="h-7 w-7 p-0 text-white hover:bg-[#700000] rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex h-[calc(100%-48px)]">
              {!selectedUserId ? (
                <div className="w-full h-full overflow-hidden">
                  <ChatUserList
                    onUserSelect={handleUserSelect}
                    selectedUserId={selectedUserId}
                  />
                </div>
              ) : (
                <div className="w-full h-full overflow-hidden">
                  <ChatInterface
                    selectedUserId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                  />
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
};

export default MessageCenter;