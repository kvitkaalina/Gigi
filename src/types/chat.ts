export interface IUser {
  _id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface IMessage {
  _id: string;
  content: string;
  sender: IUser;
  receiver: IUser;
  createdAt: string;
  read: boolean;
  type?: 'text' | 'image';
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