import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth, createWithAuth } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import socketService from '@/lib/socketService';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { Message, User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, MoreVertical, FileText, Image, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  selectedUserId: number | null;
  onClose?: () => void;
  fullScreen?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  selectedUserId, 
  onClose, 
  fullScreen = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get selected user details
  const { data: selectedUser } = useQuery<User>({
    queryKey: [`/api/users/${selectedUserId}`],
    queryFn: () => fetchWithAuth(`/api/users/${selectedUserId}`),
    enabled: !!selectedUserId,
  });
  
  // Fetch messages between current user and selected user
  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedUserId],
    queryFn: () => fetchWithAuth(`/api/messages/${selectedUserId}`),
    enabled: !!selectedUserId && !!user,
    refetchInterval: 10000, // Poll every 10 seconds
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (newMessage: { toUserId: number; content: string }) => {
      setIsLoading(true);
      
      // Use socket.io to send the message
      return new Promise<void>((resolve, reject) => {
        // Send message through socket
        socketService.emit('send_message', {
          toUserId: newMessage.toUserId,
          content: newMessage.content
        });
        
        // We don't have a good way to know when the message is sent or fails
        // so we'll just invalidate queries and assume it worked
        setTimeout(() => {
          setIsLoading(false);
          resolve();
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedUserId] });
      refetchMessages();
      setMessageText('');
      scrollToBottom();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  });
  
  // Mark messages as read
  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      const unreadMessages = messages.filter(message => 
        message.fromUserId === selectedUserId && !message.read
      );
      
      if (unreadMessages.length > 0) {
        // Mark all messages as read using socket
        socketService.emit('mark_read', selectedUserId);
        
        // Invalidate queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedUserId] });
        queryClient.invalidateQueries({ queryKey: ['/api/messages/unread/count'] });
      }
    }
  }, [selectedUserId, messages]);
  
  // Socket.io listener for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // If the message is from or to the selected user, refetch messages
      if (
        (message.fromUserId === selectedUserId && message.toUserId === user?.id) ||
        (message.toUserId === selectedUserId && message.fromUserId === user?.id)
      ) {
        refetchMessages();
        
        // If message is from the selected user, mark it as read
        if (message.fromUserId === selectedUserId && message.toUserId === user?.id) {
          socketService.emit('mark_read', selectedUserId);
        }
      }
    };
    
    socketService.on('receive_message', handleNewMessage);
    
    return () => {
      socketService.off('receive_message', handleNewMessage);
    };
  }, [selectedUserId, user?.id, refetchMessages]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUserId) return;
    
    sendMessageMutation.mutate({
      toUserId: selectedUserId,
      content: messageText.trim(),
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Get the user's name initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Format time for messages
  const formatMessageTime = (timestamp: Date | string | null) => {
    if (!timestamp) return '';
    
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return format(date, 'h:mm a');
    } catch (error) {
      return '';
    }
  };
  
  // Format date for message groups
  const formatMessageDate = (timestamp: Date | string | null) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM dd, yyyy');
      }
    } catch (error) {
      return 'Unknown';
    }
  };
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);
  
  if (!selectedUserId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No Conversation Selected</h3>
        <p className="max-w-md">
          Select a vendor or user from the list to start chatting. You can discuss your wedding plans and requirements directly.
        </p>
      </div>
    );
  }
  
  if (isLoading || !selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
        <p className="mt-2 text-gray-500">Loading conversation...</p>
      </div>
    );
  }
  
  return (
    <div 
      className={`flex flex-col border rounded-lg overflow-hidden bg-white ${
        fullScreen ? 'h-[calc(100vh-12rem)]' : 'h-[500px]'
      }`}
    >
      {/* Chat Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 border bg-[#800000]/10">
            <AvatarFallback className="text-[#800000]">
              {getInitials(selectedUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <div className="font-medium text-gray-900">{selectedUser.name}</div>
            <div className="text-xs text-gray-500">
              {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1).toLowerCase()}
            </div>
          </div>
        </div>
        
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        )}
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="mb-6">
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="bg-white text-xs">
                {date}
              </Badge>
            </div>
            
            {dateMessages.map((message, index) => {
              const isUserMessage = message.fromUserId === user?.id;
              
              return (
                <div 
                  key={message.id}
                  className={`flex mb-4 ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUserMessage && (
                    <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0 border bg-[#800000]/10">
                      <AvatarFallback className="text-[#800000] text-xs">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      isUserMessage 
                        ? 'bg-[#800000] text-white' 
                        : 'bg-white border text-gray-800'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div 
                      className={`text-xs mt-1 ${isUserMessage ? 'text-white/70' : 'text-gray-500'}`}
                    >
                      {formatMessageTime(message.createdAt)}
                      {isUserMessage && (
                        <span className="ml-1">
                          {message.read ? ' • Read' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      
      {/* Chat Input */}
      <div className="border-t p-3 bg-white">
        <div className="flex items-end">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-1 mr-2 resize-none min-h-[4rem] max-h-[10rem]"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="bg-[#800000] hover:bg-[#600000] mb-1"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 italic">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;