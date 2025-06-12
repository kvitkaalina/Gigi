import React, { useEffect, useState, useRef, useCallback } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { useSocket } from '../../hooks/useSocket';
import chatApi from '../../api/chatApi';
import { IChat, IMessage } from '../../types/chat';
import { STATIC_URL } from '../../config';
import styles from './Chat.module.css';
import { useNavigate } from 'react-router-dom';

interface ChatProps {
  chat: IChat;
  messages: IMessage[];
  onSendMessage: (message: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ chat, messages: initialMessages, onSendMessage }) => {
  const [messages, setMessages] = useState<IMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef(new Set<string>());
  const navigate = useNavigate();
  
  const { startTyping, stopTyping } = useSocket({
    onNewMessage: (message: IMessage) => {
      if ((message.sender._id === chat.user._id || message.receiver._id === chat.user._id) && 
          !messageIds.current.has(message._id)) {
        messageIds.current.add(message._id);
        setMessages(prev => [...prev, message]);
      }
    },
    onUserTyping: (userId: string) => {
      if (chat.user._id === userId) {
        setIsTyping(true);
      }
    },
    onUserStopTyping: (userId: string) => {
      if (chat.user._id === userId) {
        setIsTyping(false);
      }
    },
    onUserStatusChanged: (data) => {
      // Обработка изменения статуса пользователя не требуется в этом компоненте
    }
  });

  const formatMessageTime = (date: string): string => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday ' + format(messageDate, 'HH:mm');
    } else {
      return format(messageDate, 'MMM d HH:mm');
    }
  };

  useEffect(() => {
    if (messages.length > initialMessages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, initialMessages.length]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const chatMessages = await chatApi.getMessages(chat.user._id);
        messageIds.current.clear();
        chatMessages.forEach(msg => messageIds.current.add(msg._id));
        setMessages(chatMessages);
        await chatApi.markAsRead(chat.user._id);
      } catch (error) {
        console.error('Error loading messages:', error);
        setError('Failed to load messages');
      }
    };

    loadMessages();
  }, [chat.user._id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${chat.user.username}`);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.chat}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatarContainer}>
            <img
              src={chat.user.avatar.startsWith('http') ? chat.user.avatar : `${STATIC_URL}${chat.user.avatar}`}
              alt={chat.user.username}
              className={styles.avatar}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.jpg';
              }}
            />
            {chat.user.isOnline && <div className={styles.onlineIndicator} />}
          </div>
          <div className={styles.userDetails}>
            <h3>{chat.user.username}</h3>
            <span className={styles.status}>
              {chat.user.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <button 
          className={styles.profileButton}
          onClick={handleViewProfile}
        >
          View Profile
        </button>
      </header>

      <div className={styles.messages}>
        {messages.map((message) => (
          <div
            key={message._id}
            className={`${styles.message} ${
              message.sender._id === chat.user._id ? styles.received : styles.sent
            }`}
          >
            <div className={styles.bubble}>
              <p>{message.content}</p>
              <time>{formatMessageTime(message.createdAt)}</time>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className={styles.typing}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className={styles.footer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            startTyping(chat.user._id);
            setTimeout(() => stopTyping(chat.user._id), 1000);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </footer>
    </div>
  );
}; 