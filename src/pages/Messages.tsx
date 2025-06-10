import React, { useState, useEffect } from 'react';
import Sidebar from '../components/navigation/Sidebar';
import { ChatList } from '../components/chat/ChatList';
import { Chat } from '../components/chat/Chat';
import chatApi from '../api/chatApi';
import { IChat, IMessage } from '../types/chat';
import styles from './Messages.module.css';

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const [chats, setChats] = useState<IChat[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleSendMessage = async (message: string) => {
    if (!selectedChat) return;

    try {
      const newMessage = await chatApi.sendMessage(selectedChat.user._id, message);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
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
      <div className={styles.chatList}>
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
      </div>
      <main className={styles.chatArea}>
        {selectedChat ? (
          <Chat
            chat={selectedChat}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className={styles.noChatSelected}>
            <div className={styles.noChatContent}>
              <h3>Welcome to Messages</h3>
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages; 