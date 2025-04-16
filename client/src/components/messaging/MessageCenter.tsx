import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Send, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { User } from '@shared/schema';

interface MessageCenterProps {
  role: 'client' | 'supervisor';
}

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

interface Contact {
  id: number;
  name: string;
  email: string;
  role: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: Date;
}

export function MessageCenter({ role }: MessageCenterProps) {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch contacts
  const { data: contactUsers } = useQuery<User[]>({
    queryKey: [role === 'client' ? '/api/client/supervisors' : '/api/supervisor/clients'],
    enabled: !!user,
  });

  // Update contacts based on users and messages
  useEffect(() => {
    if (!contactUsers || !user) return;

    const newContacts = contactUsers.map(contactUser => {
      // Count unread messages from this contact
      const unreadCount = messages.filter(
        m => m.fromUserId === contactUser.id && m.toUserId === user.id && !m.read
      ).length;

      // Find last message with this contact
      const conversationMessages = messages.filter(
        m => (m.fromUserId === contactUser.id && m.toUserId === user.id) ||
             (m.fromUserId === user.id && m.toUserId === contactUser.id)
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const lastMessage = conversationMessages.length > 0 ? conversationMessages[0] : undefined;

      return {
        id: contactUser.id,
        name: contactUser.name,
        email: contactUser.email,
        role: contactUser.role,
        unreadCount,
        lastMessage: lastMessage?.content,
        lastMessageTime: lastMessage?.createdAt
      };
    });

    setContacts(newContacts);
  }, [contactUsers, messages, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedContact]);

  // Mark messages as read when selecting a contact
  useEffect(() => {
    if (selectedContact && user) {
      markAsRead(selectedContact.id);
    }
  }, [selectedContact, markAsRead, user]);

  const handleSendMessage = () => {
    if (!selectedContact || !newMessage.trim() || !user) return;
    
    sendMessage(selectedContact.id, newMessage);
    setNewMessage('');
  };

  const renderContactList = () => (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2 p-2">
        {contacts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No contacts available
          </div>
        ) : (
          contacts.map(contact => (
            <div
              key={contact.id}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent ${
                selectedContact?.id === contact.id ? 'bg-accent' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <Avatar>
                <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">{contact.name}</p>
                  {contact.lastMessageTime && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(contact.lastMessageTime), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {contact.lastMessage || 'No messages yet'}
                </p>
              </div>
              {contact.unreadCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {contact.unreadCount}
                </Badge>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );

  const renderMessageThread = () => {
    if (!selectedContact) {
      return (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Select a contact to start messaging</p>
        </div>
      );
    }

    // Filter messages between current user and selected contact
    const conversationMessages = user
      ? messages.filter(
          msg =>
            (msg.fromUserId === user.id && msg.toUserId === selectedContact.id) ||
            (msg.fromUserId === selectedContact.id && msg.toUserId === user.id)
        ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      : [];

    return (
      <>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4 pt-4">
            {conversationMessages.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              conversationMessages.map(msg => {
                const isSentByMe = user && msg.fromUserId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        isSentByMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <div className={`flex items-center gap-1 text-xs mt-1 ${
                        isSentByMe ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        {isSentByMe && (
                          <span className="ml-1">
                            {msg.read ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="mt-4 flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleSendMessage}
            className="self-end"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4 mr-2" /> Send
          </Button>
        </div>
      </>
    );
  };

  return (
    <Card className="w-full h-[560px]">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          {role === 'client'
            ? 'Chat with your wedding supervisor'
            : 'Chat with your clients'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contacts">
              Contacts
              {contacts.reduce((sum, contact) => sum + contact.unreadCount, 0) > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {contacts.reduce((sum, contact) => sum + contact.unreadCount, 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages">
              {selectedContact ? selectedContact.name : 'Messages'}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="contacts" className="mt-4">
            {renderContactList()}
          </TabsContent>
          <TabsContent value="messages" className="mt-4">
            {renderMessageThread()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}