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
  onUpdateMessage?: (messageId: string, content: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ chat, messages, onSendMessage, onNewSocketMessage, onDeleteMessage, onUpdateMessage }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const socketRef = useRef<any>(null);
  
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

  const formatMessageTime = (message: IMessage): string => {
    const messageDate = new Date(message.createdAt);
    let timeStr = '';
    
    if (isToday(messageDate)) {
      timeStr = format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      timeStr = 'Yesterday ' + format(messageDate, 'HH:mm');
    } else {
      timeStr = format(messageDate, 'MMM d HH:mm');
    }
    
    if (message.updatedAt) {
      timeStr += ' (edited)';
    }
    
    return timeStr;
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

  const handleEditClick = (message: IMessage) => {
    setEditingId(message._id);
    setEditingValue(message.content);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  const handleEditSave = async (messageId: string) => {
    if (!editingValue.trim()) return;
    
    try {
      // Сначала отправляем изменения на сервер
      await chatApi.editMessage(messageId, editingValue);
      
      // Находим сообщение для обновления
      const messageToUpdate = messages.find(m => m._id === messageId);
      if (messageToUpdate) {
        // Создаем обновленное сообщение
        const updatedMessage = {
          ...messageToUpdate,
          content: editingValue,
          updatedAt: new Date().toISOString() // Добавляем время обновления
        };
        
        // Отправляем обновленное сообщение через socket для синхронизации
        onNewSocketMessage(updatedMessage);
      }
      
      // Сбрасываем состояние редактирования
      setEditingId(null);
      setEditingValue('');
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Ошибка при редактировании сообщения');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const renderMessage = (message: IMessage) => {
    const isOwn = message.sender._id === currentUserId;
    const isImage = message.type === 'image';
    return (
      <div
        key={message._id}
        className={`${styles.message} ${isOwn ? styles.sent : styles.received} ${isImage ? styles.messageImageOnly : ''}`}
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
            <time>{formatMessageTime(message)}</time>
            {isOwn && (
              <button className={styles.deleteButton} onClick={() => onDeleteMessage(message._id)} title="Delete message">✖</button>
            )}
          </>
        ) : (
          <div className={styles.bubble}>
            {editingId === message._id ? (
              <div className={styles.editContainer}>
                <input
                  className={styles.editInput}
                  value={editingValue}
                  onChange={handleEditChange}
                  autoFocus
                />
                <div className={styles.editButtons}>
                  <button className={styles.saveButton} onClick={() => handleEditSave(message._id)} title="Save">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>
                  <button className={styles.cancelButton} onClick={handleEditCancel} title="Cancel">
                    <svg viewBox="0 0 24 24">
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>{message.content}</p>
                {isOwn && (
                  <>
                    <button className={styles.editButton} onClick={() => handleEditClick(message)} title="Edit message">
                      <svg viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className={styles.deleteButton} onClick={() => onDeleteMessage(message._id)} title="Delete message">
                      <svg viewBox="0 0 24 24">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
                <div className={styles.messageControls}>
                  <time>{formatMessageTime(message)}</time>
                </div>
              </>
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
                target.src = '/images/my-avatar-placeholder.png';
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