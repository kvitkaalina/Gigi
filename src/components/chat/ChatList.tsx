import React, { useState } from 'react';
import { IChat, IUser } from '../../types/chat';
import { formatDistanceToNow } from 'date-fns';
import chatApi from '../../api/chatApi';
import { STATIC_URL } from '../../config';
import styles from './ChatList.module.css';

interface ChatListProps {
  chats: IChat[];
  selectedChat: IChat | null;
  onSelectChat: (chat: IChat) => void;
  onNewChat: (chat: IChat) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, selectedChat, onSelectChat, onNewChat }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsLoading(true);
      try {
        const results = await chatApi.searchUsers(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const startNewChat = async (user: IUser) => {
    try {
      const newChat = await chatApi.createChat(user._id);
      onNewChat(newChat);
      setIsSearching(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Messages</h2>
        <button
          className={styles.newChatButton}
          onClick={() => setIsSearching(true)}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {isSearching ? (
        <div className={styles.searchContainer}>
          <div className={styles.searchHeader}>
            <button
              className={styles.backButton}
              onClick={() => {
                setIsSearching(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              Back
            </button>
          </div>
          <div className={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.searchResults}>
            {isLoading ? (
              <div className={styles.loading}>Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user._id}
                  className={styles.searchResultItem}
                  onClick={() => startNewChat(user)}
                >
                  <img
                    src={user.avatar.startsWith('http') ? user.avatar : `${STATIC_URL}${user.avatar}`}
                    alt={user.username}
                    className={styles.avatar}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.jpg';
                    }}
                  />
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.username}</span>
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className={styles.noResults}>No users found</div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={styles.chatList}>
          {chats.length > 0 &&
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`${styles.chatItem} ${
                  selectedChat?._id === chat._id ? styles.active : ''
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <div className={styles.chatItemAvatar}>
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
                <div className={styles.chatItemInfo}>
                  <div className={styles.chatItemName}>{chat.user.username}</div>
                  <div className={styles.lastMessage}>
                    <span className={styles.messageText}>
                      {chat.lastMessage?.content || 'No messages yet'}
                    </span>
                    {chat.lastMessage && (
                      <span className={styles.messageTime}>
                        {formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                {chat.unreadCount > 0 && (
                  <div className={styles.unreadCount}>{chat.unreadCount}</div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};


export default ChatList;