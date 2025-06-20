import React, { useState } from 'react';
import { ChatList } from '../chat/ChatList';
import { IChat } from '../../types/chat';
import styles from './RepostModal.module.css';

interface RepostModalProps {
  postId: string;
  onClose: () => void;
  onRepost: (chatId: string, comment: string) => void;
  sourcePage?: 'home' | 'profile';
}

const RepostModal: React.FC<RepostModalProps> = ({ postId, onClose, onRepost, sourcePage }) => {
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const [comment, setComment] = useState('');
  const [chats, setChats] = useState<IChat[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSelectChat = (chat: IChat) => {
    setSelectedChat(chat);
  };

  const handleNewChat = (chat: IChat) => {
    setChats(prevChats => {
      const chatExists = prevChats.some(c => c._id === chat._id);
      if (chatExists) {
        return prevChats;
      }
      return [chat, ...prevChats];
    });
    setSelectedChat(chat);
  };

  const handleSubmit = () => {
    if (selectedChat) {
      onRepost(selectedChat._id, comment);
      onClose();
    }
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleCloseModal}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Share Post</h2>
          <button className={styles.closeButton} onClick={handleCloseModal}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className={styles.content}>
          <ChatList
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
          />
          <div className={styles.commentSection}>
            <textarea
              placeholder="Add a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={styles.commentInput}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.repostButton}
            onClick={handleSubmit}
            disabled={!selectedChat}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepostModal; 