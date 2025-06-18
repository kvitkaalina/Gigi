export interface IUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
  updatedAt?: string;
  isOnline?: boolean;
} 