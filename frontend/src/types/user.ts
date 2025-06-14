export interface User {
  userId: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  bio?: string;
  avatarUrl?: string;
}
