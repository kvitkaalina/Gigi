import { useEffect, useCallback, useState } from 'react';
import { IMessage } from '../types/chat';
import chatService from '../services/chatService';

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

export const useSocket = (props: UseSocketProps) => {
  const {
    onNewMessage,
    onUserTyping,
    onUserStopTyping,
    onUserStatusChanged
  } = props;

  const [isConnected, setIsConnected] = useState(chatService.isConnected());

  useEffect(() => {
    // Регистрируем обработчики событий
    const unsubscribeMessage = chatService.onNewMessage(onNewMessage);
    const unsubscribeTyping = chatService.onUserTyping(onUserTyping);
    const unsubscribeStopTyping = chatService.onUserStopTyping(onUserStopTyping);
    const unsubscribeStatus = chatService.onUserStatusChanged(onUserStatusChanged);

    // Создаем интервал для проверки состояния подключения
    const connectionCheckInterval = setInterval(() => {
      const currentIsConnected = chatService.isConnected();
      if (currentIsConnected !== isConnected) {
        setIsConnected(currentIsConnected);
      }
    }, 1000);

    // Отписываемся при размонтировании
    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeStopTyping();
      unsubscribeStatus();
      clearInterval(connectionCheckInterval);
    };
  }, [onNewMessage, onUserTyping, onUserStopTyping, onUserStatusChanged, isConnected]);

  const startTyping = useCallback((recipientId: string) => {
    if (isConnected) {
      chatService.startTyping(recipientId);
    }
  }, [isConnected]);

  const stopTyping = useCallback((recipientId: string) => {
    if (isConnected) {
      chatService.stopTyping(recipientId);
    }
  }, [isConnected]);

  return {
    startTyping,
    stopTyping,
    isConnected
  };
}; 