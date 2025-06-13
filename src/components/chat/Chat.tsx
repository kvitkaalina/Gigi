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
  onSendMessage: (message: string, type?: 'text' | 'image', file?: File) => void;
  onNewSocketMessage: (message: IMessage) => void;
  onDeleteMessage: (messageId: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ chat, messages, onSendMessage, onNewSocketMessage, onDeleteMessage }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');
  
  const { startTyping, stopTyping } = useSocket({
    onNewMessage: (message: IMessage) => {
      onNewSocketMessage(message);
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

  function isUserAtBottom(): boolean {
    const container = messagesContainerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 50;
  }

  useEffect(() => {
    if (isUserAtBottom()) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const chatMessages = await chatApi.getMessages(chat.user._id);
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
      onSendMessage(newMessage.trim(), 'text');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      onSendMessage('', 'image', file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${chat.user.username}`);
  };

  const renderMessage = (message: IMessage) => {
    const isOwn = message.sender._id === currentUserId;
    const isSent = !isOwn;
    const isImage = message.type === 'image';
    return (
      <div
        key={message._id}
        className={`${styles.message} ${isSent ? styles.sent : styles.received} ${isImage ? styles.messageImageOnly : ''}`}
        style={{ position: 'relative' }}
      >
        {isImage ? (
          <>
            <img 
              src={`${STATIC_URL}${message.content}`} 
              alt="Message attachment" 
              className={styles.messageImage}
              onClick={() => window.open(`${STATIC_URL}${message.content}`, '_blank')}
            />
            <time>{formatMessageTime(message.createdAt)}</time>
            {isOwn && (
              <button className={styles.deleteButton} onClick={() => onDeleteMessage(message._id)} title="Delete message">✖</button>
            )}
          </>
        ) : (
          <div className={styles.bubble} style={{ position: 'relative' }}>
            <p>{message.content}</p>
            <time>{formatMessageTime(message.createdAt)}</time>
            {isOwn && (
              <button className={styles.deleteButton} onClick={() => onDeleteMessage(message._id)} title="Delete message">✖</button>
            )}
          </div>
        )}
      </div>
    );
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

      <div className={styles.messages} ref={messagesContainerRef}>
        {messages.map(renderMessage)}
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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={styles.imageButton}
          title="Send image"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className={styles.sendButton}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </footer>
    </div>
  );
}; 