import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/navigation/Sidebar';
import { ChatList } from '../components/chat/ChatList';
import { Chat } from '../components/chat/Chat';
import chatApi from '../api/chatApi';
import { IChat, IMessage } from '../types/chat';
import styles from './Messages.module.css';
import PostsInfo from '../components/feed/PostsInfo';

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const [chats, setChats] = useState<IChat[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messageIds = useRef(new Set<string>());

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const response = await chatApi.getChats();
        setChats(response);
        if (response.length > 0) {
          setSelectedChat(response[0]);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        setError('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (selectedChat) {
        try {
          setLoading(true);
          const chatMessages = await chatApi.getMessages(selectedChat.user._id);
          messageIds.current.clear();
          chatMessages.forEach(msg => messageIds.current.add(msg._id));
          setMessages(chatMessages);
        } catch (error) {
          console.error('Error loading messages:', error);
          setError('Failed to load messages');
        } finally {
          setLoading(false);
        }
      }
    };

    loadMessages();
  }, [selectedChat]);

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

  const handleSendMessage = async (message: string, type: 'text' | 'image' = 'text', file?: File) => {
    if (!selectedChat) return;

    try {
      await chatApi.sendMessage(selectedChat.user._id, message, type, file);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleNewSocketMessage = (message: IMessage) => {
    const isUpdate = messages.some(m => m._id === message._id);
    
    setMessages(prev => {
      if (isUpdate) {
        return prev.map(m => m._id === message._id ? message : m);
      }
      if (prev.some(m => m._id === message._id)) return prev;
      return [...prev, message];
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatApi.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (error) {
      setError('Failed to delete message');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      await chatApi.editMessage(messageId, newContent);
      setMessages(prev => prev.map(m => 
        m._id === messageId ? { ...m, content: newContent } : m
      ));
    } catch (error) {
      setError('Failed to edit message');
    }
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <div className={styles.chatList}>
          <ChatList
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
          />
          <div className={styles.copyright}>© 2024 GiGi</div>
        </div>
        <main className={styles.chatArea}>
          {selectedChat ? (
            <Chat
              chat={selectedChat}
              messages={messages}
              onSendMessage={handleSendMessage}
              onNewSocketMessage={handleNewSocketMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          ) : (
            <div className={styles.noChatSelected}>
              <div className={styles.noChatContent}>
                <img 
                  src="/images/gigi.png" 
                  alt="Welcome to Messages" 
                  className={styles.welcomeImage}
                />
                <h3>Welcome to Messages</h3>
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages; 