import { io, Socket } from 'socket.io-client';
import { User } from '@shared/schema';

interface SocketServiceEvents {
  onConnect: (callback: () => void) => void;
  onDisconnect: (callback: () => void) => void;
  onAuthenticated: (callback: (data: { success: boolean }) => void) => void;
  onAuthError: (callback: (error: string) => void) => void;
  onReceiveMessage: (callback: (message: any) => void) => void;
  onMessageSent: (callback: (data: { success: boolean, messageId: number }) => void) => void;
  onMessageStatusUpdate: (callback: (data: { toUserId: number, read: boolean }) => void) => void;
  onMessagesMarkedRead: (callback: (data: { success: boolean }) => void) => void;
  onSupervisorAssigned: (callback: (data: { 
    supervisorId: number, 
    supervisorName: string, 
    supervisorEmail: string 
  }) => void) => void;
  onClientAssigned: (callback: (data: { 
    clientId: number, 
    clientName: string, 
    clientEmail: string, 
    package?: string 
  }) => void) => void;
  onAllocationSuccess: (callback: (data: { success: boolean }) => void) => void;
  onError: (callback: (error: string) => void) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private authenticated = false;
  private user: User | null = null;

  constructor() {
    this.initSocket();
  }

  private initSocket(): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    this.socket = io(wsUrl, {
      path: '/ws',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      this.authenticated = false;
    });
  }

  authenticate(user: User): void {
    if (!this.socket || !user.email) return;

    this.user = user;
    
    // Send email for authentication (our server handles both token and email auth)
    this.socket.emit('authenticate', { email: user.email });

    this.socket.on('authenticated', (data: { success: boolean, userId?: number, role?: string }) => {
      this.authenticated = data.success;
      console.log('Socket authenticated:', data.success);
    });
    
    this.socket.on('unread_count', (data: { count: number }) => {
      console.log('Unread messages count:', data.count);
      // We can emit an event or update a state here if needed
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.authenticated = false;
      this.user = null;
    }
  }

  sendMessage(toUserId: number, message: string, type = 'text'): void {
    if (!this.socket || !this.authenticated) return;

    this.socket.emit('send_message', { toUserId, message, type });
  }

  markMessagesAsRead(fromUserId: number): void {
    if (!this.socket || !this.authenticated) return;

    this.socket.emit('mark_messages_read', { fromUserId });
  }

  notifySupervisorAllocation(clientId: number, supervisorId: number): void {
    if (!this.socket || !this.authenticated || !this.user || this.user.role !== 'admin') return;

    this.socket.emit('supervisor_allocated', { clientId, supervisorId });
  }

  // Event listeners
  on: SocketServiceEvents = {
    onConnect: (callback) => {
      if (this.socket) {
        this.socket.on('connect', callback);
      }
    },

    onDisconnect: (callback) => {
      if (this.socket) {
        this.socket.on('disconnect', callback);
      }
    },

    onAuthenticated: (callback) => {
      if (this.socket) {
        this.socket.on('authenticated', callback);
      }
    },

    onAuthError: (callback) => {
      if (this.socket) {
        this.socket.on('authentication_error', callback);
      }
    },

    onReceiveMessage: (callback) => {
      if (this.socket) {
        this.socket.on('receive_message', callback);
      }
    },

    onMessageSent: (callback) => {
      if (this.socket) {
        this.socket.on('message_sent', callback);
      }
    },

    onMessageStatusUpdate: (callback) => {
      if (this.socket) {
        this.socket.on('message_status_update', callback);
      }
    },

    onMessagesMarkedRead: (callback) => {
      if (this.socket) {
        this.socket.on('messages_marked_read', callback);
      }
    },

    onSupervisorAssigned: (callback) => {
      if (this.socket) {
        this.socket.on('supervisor_assigned', callback);
      }
    },

    onClientAssigned: (callback) => {
      if (this.socket) {
        this.socket.on('client_assigned', callback);
      }
    },

    onAllocationSuccess: (callback) => {
      if (this.socket) {
        this.socket.on('allocation_success', callback);
      }
    },

    onError: (callback) => {
      if (this.socket) {
        this.socket.on('error', callback);
      }
    },
  };

  // Helper methods
  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;