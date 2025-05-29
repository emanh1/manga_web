export interface User {
  uuid: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  bio?: string;
  avatarUrl?: string;
}
