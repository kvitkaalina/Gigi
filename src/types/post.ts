import { IUser } from './user';

export interface IPost {
  _id: string;
  author: IUser;
  image: string;
  description?: string;
  likes: string[];
  comments: {
    _id: string;
    author: IUser;
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt?: string;
} 