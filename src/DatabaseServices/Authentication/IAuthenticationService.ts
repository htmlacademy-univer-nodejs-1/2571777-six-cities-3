import { User } from '../../models/index.js';

export interface IAuthenticationService {
  login(username: string, password: string): Promise<{ token: string; message: string }>;
  logout(token: string): Promise<{ message: string }>;
  getUserInfo(token: string): Promise<User | null>;
}