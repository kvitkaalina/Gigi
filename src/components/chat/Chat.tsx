import React, { useEffect, useState, useRef, useCallback } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { useSocket } from '../../hooks/useSocket';
import chatApi from '../../api/chatApi';
import { IChat, IMessage } from '../../types/chat';
import { STATIC_URL } from '../../config';
import styles from './Chat.module.css';
import { useNavigate } from 'react-router-dom';
import Picker from '@emoji-mart/react';
import chatService from '../../services/chatService';

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
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  const isUserAtBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 50;
  }, []);

  const handleScroll = useCallback(() => {
    setShouldAutoScroll(isUserAtBottom());
  }, [isUserAtBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  const { startTyping, stopTyping } = useSocket({
    onNewMessage: (message: IMessage) => {
      if (message.sender._id === chat.user._id || message.receiver._id === chat.user._id) {
        console.log('New message in current chat:', message);
        onNewSocketMessage(message);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message = await chatService.sendMessage(chat.user._id, newMessage.trim(), 'text');
      setNewMessage('');
      onNewSocketMessage(message);
      await chatApi.markAsRead(chat.user._id);
      const container = messagesContainerRef.current;
      if (container) {
        const scrollHeight = container.scrollHeight;
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = scrollHeight;
          }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      
      const response = await fetch(`${STATIC_URL}/api/messages/${chat.user._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const message = await response.json();
      onNewSocketMessage(message);
      const container = messagesContainerRef.current;
      if (container) {
        const scrollHeight = container.scrollHeight;
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = scrollHeight;
          }
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const chatMessages = await chatApi.getMessages(chat.user._id);
        await chatApi.markAsRead(chat.user._id);
        if (chatMessages.length > 0) {
          chatMessages.forEach(message => {
            onNewSocketMessage(message);
          });
          requestAnimationFrame(() => {
            const container = messagesContainerRef.current;
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          });
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setError('Failed to load messages');
      }
    };

    loadMessages();

    const token = localStorage.getItem('token');
    if (token) {
      chatService.connect(token);
    }

    return () => {
      chatService.onNewMessage(() => {});
      chatService.onUserTyping(() => {});
      chatService.onUserStopTyping(() => {});
      chatService.onUserStatusChanged(() => {});
    };
  }, [chat.user._id]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, [chat._id]);

  const handleViewProfile = () => {
    navigate(`/profile/${chat.user.username}`);
  };

  const handleEditClick = (message: IMessage) => {
    setEditingId(message._id);
    setEditingValue(message.content);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingValue(e.target.value);
    if (editInputRef.current) {
      editInputRef.current.style.height = 'auto';
      editInputRef.current.style.height = editInputRef.current.scrollHeight + 'px';
    }
  };

  const handleEditSave = async (messageId: string) => {
    if (!editingValue.trim()) return;
    
    try {
      await chatApi.editMessage(messageId, editingValue);
      
      const messageToUpdate = messages.find(m => m._id === messageId);
      if (messageToUpdate) {
        const updatedMessage = {
          ...messageToUpdate,
          content: editingValue,
          updatedAt: new Date().toISOString()
        };
        
        onNewSocketMessage(updatedMessage);
      }
      
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

  const handleEmojiSelect = (emoji: any) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const emojiChar = emoji.native || '';
    const newValue = newMessage.slice(0, start) + emojiChar + newMessage.slice(end);
    setNewMessage(newValue);
    setShowEmojiPicker(false);
    setTimeout(() => {
      input.focus();
      input.selectionStart = input.selectionEnd = start + emojiChar.length;
    }, 0);
  };

  const renderMessage = (message: IMessage) => {
    const isOwn = message.sender._id === currentUserId;
    const isImage = message.type === 'image';
    const isRepost = message.type === 'repost';
    const isEditing = editingId === message._id;

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
              <button className={styles.deleteButton} onClick={() => onDeleteMessage(message._id)} title="Delete message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            )}
          </>
        ) : isRepost ? (
          <div className={styles.repostBubble}>
            <span className={styles.repostLabel}>
              <i className="fas fa-paper-plane" style={{ fontSize: 13, color: '#b0b0b0', opacity: 0.7 }}></i>
            </span>
            {isOwn && (
              <button className={styles.repostDeleteButton} onClick={() => onDeleteMessage(message._id)} title="Delete repost">
                <i className="fas fa-times"></i>
              </button>
            )}
            <div className={styles.repostImageWrapper}>
              <img 
                src={message.postId?.image ? `${STATIC_URL}${message.postId.image}` : '/images/my-avatar-placeholder.png'} 
                alt="Reposted post" 
                className={styles.repostImage}
                onClick={() => navigate(`/post/${message.postId?._id}`)}
              />
            </div>
            <div className={styles.repostMeta}>
              <span className={styles.repostAuthor}>{message.postId?.author?.username}</span>
              {message.postId?.description && (
                <span className={styles.repostDescription}>{message.postId.description}</span>
              )}
            </div>
            {message.comment && (
              <div className={styles.repostCommentBubble}>{message.comment}</div>
            )}
            <span className={styles.repostTime}>{formatMessageTime(message)}</span>
          </div>
        ) : (
          <div className={`${styles.bubble} ${isEditing ? styles.editing : ''}`}>
            {isEditing ? (
              <div className={styles.editContainer}>
                <textarea
                  ref={editInputRef}
                  className={styles.editInput}
                  value={editingValue}
                  onChange={handleEditChange}
                  autoFocus
                  rows={1}
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
              src={
                typeof chat.user.avatar === 'string'
                  ? (chat.user.avatar.startsWith('http')
                      ? chat.user.avatar
                      : `${STATIC_URL}${chat.user.avatar}`)
                  : '/images/my-avatar-placeholder.png'
              }
              alt={chat.user.username}
              className={styles.avatar}
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
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
        {messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map(renderMessage)}
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
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 8, fontSize: 22 }}
            tabIndex={-1}
          >
            <span role="img" aria-label="emoji">😊</span>
          </button>
          {showEmojiPicker && (
            <div style={{ position: 'absolute', bottom: '48px', left: 0, zIndex: 10 }}>
              <Picker onEmojiSelect={handleEmojiSelect} theme="light" />
            </div>
          )}
          <input
            ref={inputRef}
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
            style={{ flex: 1 }}
          />
        </div>
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
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
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