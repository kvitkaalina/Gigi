import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { IMessage } from '../types/chat';

const SOCKET_URL = 'http://localhost:5001';

interface IUserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface UseSocketProps {
  onNewMessage: (message: IMessage) => void;
  onUserTyping: (userId: string) => void;
  onUserStopTyping: (userId: string) => void;
  onUserStatusChanged: (data: IUserStatus) => void;
}

const useAuth = () => {
  return {
    token: localStorage.getItem('token')
  };
};

export const useSocket = (props: UseSocketProps) => {
  const {
    onNewMessage,
    onUserTyping,
    onUserStopTyping,
    onUserStatusChanged
  } = props;

  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    // Закрываем предыдущее соединение, если оно есть
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Если сервер разорвал соединение, пробуем переподключиться
        socket.connect();
      }
    });

    socket.on('newMessage', (message: IMessage) => {
      onNewMessage({
        ...message,
        type: message.type || 'text',
        read: message.read ?? false
      });
    });

    socket.on('userTyping', onUserTyping);
    socket.on('userStoppedTyping', onUserStopTyping);
    socket.on('userStatusChanged', onUserStatusChanged);

    socket.io.on('reconnect', (attempt: number) => {
      console.log('Socket reconnected after', attempt, 'attempts');
    });

    socket.io.on('reconnect_attempt', (attempt: number) => {
      console.log('Socket reconnection attempt', attempt);
    });

    socket.io.on('reconnect_error', (error: Error) => {
      console.error('Socket reconnection error:', error);
    });

    socket.io.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, onNewMessage, onUserTyping, onUserStopTyping, onUserStatusChanged]);

  const sendMessage = useCallback((recipientId: string, content: string, type: 'text' | 'image' = 'text') => {
    if (!socketRef.current?.connected) {
      console.warn('Socket is not connected');
      return Promise.reject(new Error('Socket is not connected'));
    }

    return new Promise((resolve, reject) => {
      socketRef.current?.emit('sendMessage', { recipientId, content, type }, (response: any) => {
        if (response?.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Failed to send message'));
        }
      });
    });
  }, []);

  const startTyping = useCallback((recipientId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { recipientId });
    }
  }, []);

  const stopTyping = useCallback((recipientId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('stopTyping', { recipientId });
    }
  }, []);

  return {
    sendMessage,
    startTyping,
    stopTyping,
    isConnected: socketRef.current?.connected || false
  };
}; 