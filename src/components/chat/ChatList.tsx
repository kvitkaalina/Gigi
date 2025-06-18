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

  // Сортировка чатов по времени последнего сообщения (новые сверху)
  const sortedChats = [...chats].sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {isSearching && (
          <button
            className={styles.backButton}
            onClick={() => {
              setIsSearching(false);
              setSearchQuery('');
              setSearchResults([]);
            }}
            aria-label="Back to chat list"
            style={{ marginRight: 8 }}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
        )}
        <h2>Messages</h2>
        <button
          className={styles.newChatButton}
          onClick={() => setIsSearching(true)}
          aria-label="Start new chat"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <div className={styles.headerDivider}></div>

      {isSearching ? (
        <div className={styles.searchContainer}>
          <div className={styles.searchHeader}>
            <div className={styles.searchInputContainer}>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
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
                      target.src = '/images/my-avatar-placeholder.png';
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
          {sortedChats.length > 0 &&
            sortedChats.map((chat) => (
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
                      target.src = '/images/my-avatar-placeholder.png';
                    }}
                  />
                  {chat.user.isOnline && <div className={styles.onlineIndicator} />}
                </div>
                <div className={styles.chatItemInfo}>
                  <div className={styles.chatItemName}>{chat.user.username}</div>
                  <div className={styles.lastMessage}>
                    <span className={styles.messageText}>
                      {chat.lastMessage ? (
                        chat.lastMessage.type === 'image' ? (
                          <>
                            <span role="img" aria-label="Photo" style={{marginRight: 4}}>🖼️</span>Photo
                          </>
                        ) : chat.lastMessage.type === 'repost' ? (
                          <>
                            <span style={{marginRight: 4, display: 'inline-flex', verticalAlign: 'middle'}}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3a5e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="17 1 21 5 17 9"/>
                                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                                <polyline points="7 23 3 19 7 15"/>
                                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                              </svg>
                            </span>
                            Repost
                            {chat.lastMessage.postId?.author?.username && (
                              <span style={{marginLeft: 4, color: '#888'}}>
                                {chat.lastMessage.postId.author.username}
                              </span>
                            )}
                            {chat.lastMessage.postId?.description && (
                              <span style={{marginLeft: 4, color: '#bbb', fontStyle: 'italic'}}>
                                {chat.lastMessage.postId.description}
                              </span>
                            )}
                          </>
                        ) : (
                          chat.lastMessage.content
                        )
                      ) : (
                        ''
                      )}
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
                {chat.unreadCount > 0 && localStorage.getItem('userId') !== chat.lastMessage?.sender?._id && (
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