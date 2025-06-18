import { IPost } from './post';

export interface IUser {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface IMessage {
  _id: string;
  sender: IUser;
  receiver: IUser;
  content: string;
  type: 'text' | 'image' | 'repost';
  createdAt: string;
  updatedAt?: string;
  read: boolean;
  postId?: {
    _id: string;
    image: string;
    description: string;
    author: IUser;
  };
  comment?: string;
}

export interface IChat {
  _id: string;
  user: IUser;
  lastMessage: IMessage;
  unreadCount: number;
}

export interface IChatState {
  chats: IChat[];
  currentChat: IChat | null;
  messages: IMessage[];
  loading: boolean;
  error: string | null;
} 