import { io, Socket } from 'socket.io-client';
import { IMessage, IUser } from '../types/chat';
import { API_URL } from '../config';

class ChatService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: IMessage) => void)[] = [];
  private typingCallbacks: ((userId: string) => void)[] = [];
  private stopTypingCallbacks: ((userId: string) => void)[] = [];
  private statusCallbacks: ((data: { userId: string; isOnline: boolean; lastSeen?: string }) => void)[] = [];
  private connectionAttempts: number = 0;
  private readonly MAX_RECONNECTION_ATTEMPTS = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isReconnecting: boolean = false;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    if (this.isReconnecting) {
      console.log('Already attempting to reconnect');
      return;
    }

    if (this.connectionAttempts >= this.MAX_RECONNECTION_ATTEMPTS) {
      console.log('Max reconnection attempts reached');
      this.disconnect();
      this.connectionAttempts = 0;
      return;
    }

    if (this.socket) {
      console.log('Socket exists but not connected, attempting reconnect');
      this.attemptReconnect();
      return;
    }

    console.log('Creating new socket connection');
    this.socket = io(API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.MAX_RECONNECTION_ATTEMPTS,
      timeout: 20000
    });

    this.setupListeners();
  }

  private attemptReconnect() {
    if (this.isReconnecting || !this.socket) return;

    this.isReconnecting = true;
    this.connectionAttempts++;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnection attempt ${this.connectionAttempts}/${this.MAX_RECONNECTION_ATTEMPTS}`);
      this.socket?.connect();
      this.isReconnecting = false;
    }, 1000 * Math.min(this.connectionAttempts, 5)); // Exponential backoff capped at 5 seconds
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.connectionAttempts = 0;
      this.isReconnecting = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason);
      
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.attemptReconnect();
    });

    this.socket.on('newMessage', (message: IMessage) => {
      console.log('New message received:', message);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('userTyping', (userId: string) => {
      this.typingCallbacks.forEach(callback => callback(userId));
    });

    this.socket.on('userStoppedTyping', (userId: string) => {
      this.stopTypingCallbacks.forEach(callback => callback(userId));
    });

    this.socket.on('userStatusChanged', (data: { userId: string; isOnline: boolean; lastSeen?: string }) => {
      this.statusCallbacks.forEach(callback => callback(data));
    });
  }

  onNewMessage(callback: (message: IMessage) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onUserTyping(callback: (userId: string) => void) {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }

  onUserStopTyping(callback: (userId: string) => void) {
    this.stopTypingCallbacks.push(callback);
    return () => {
      this.stopTypingCallbacks = this.stopTypingCallbacks.filter(cb => cb !== callback);
    };
  }

  onUserStatusChanged(callback: (data: { userId: string; isOnline: boolean; lastSeen?: string }) => void) {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  sendMessage(
    recipientId: string,
    content: string,
    type: 'text' | 'image' | 'repost' = 'text',
    postId?: string,
    comment?: string
  ): Promise<IMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      const messageData = type === 'repost' 
        ? { recipientId, content, type, postId, comment }
        : { recipientId, content, type };

      this.socket.emit('sendMessage', messageData, (response: any) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error || 'Failed to send message'));
        }
      });
    });
  }

  startTyping(recipientId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { recipientId });
    }
  }

  stopTyping(recipientId: string) {
    if (this.socket?.connected) {
      this.socket.emit('stopTyping', { recipientId });
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connectionAttempts = 0;
    this.isReconnecting = false;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const chatService = new ChatService();
export default chatService; 