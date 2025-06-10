import { io, Socket } from 'socket.io-client';
import { IMessage, IUser } from '../types/chat';
import { API_URL } from '../config';

class ChatService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: IMessage) => void)[] = [];
  private typingCallbacks: ((userId: string) => void)[] = [];
  private stopTypingCallbacks: ((userId: string) => void)[] = [];
  private statusCallbacks: ((data: { userId: string; isOnline: boolean; lastSeen?: string }) => void)[] = [];

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    this.socket.on('newMessage', (message: IMessage) => {
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

  sendMessage(recipientId: string, content: string): Promise<IMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      this.socket.emit('sendMessage', { recipientId, content }, (response: any) => {
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
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const chatService = new ChatService();
export default chatService; 