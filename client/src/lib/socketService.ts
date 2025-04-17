import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  
  // Connect to the socket server 
  public connect(token: string): void {
    if (this.isConnected) return;
    
    // Dynamically determine the appropriate websocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // Create socket connection with authentication token
    this.socket = io(`${window.location.protocol}//${host}`, {
      path: '/ws',
      auth: {
        token
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
    
    // Setup event handlers
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO');
      this.isConnected = true;
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
    
    this.socket.on('disconnect', () => {
      console.log('Connection closed');
      this.isConnected = false;
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  
  // Disconnect from the socket server
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  // Listen for events
  public on(event: string, handler: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }
    
    this.socket.on(event, handler);
  }
  
  // Stop listening for events
  public off(event: string, handler?: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }
    
    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.off(event);
    }
  }
  
  // Emit an event
  public emit(event: string, ...args: any[]): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }
    
    this.socket.emit(event, ...args);
  }
  
  // Check if connected
  public isSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;