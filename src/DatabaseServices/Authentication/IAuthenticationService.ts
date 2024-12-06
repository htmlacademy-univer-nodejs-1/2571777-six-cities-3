import { LoginDto } from '../../dtoModels/loginRequest.dto.js';
import { User } from '../../models/index.js';

export interface AuthenticationService {
  login(dto: LoginDto, password: string): Promise<{ token: string; message: string }>;
  logout(token: string): Promise<{ message: string }>;
  getUserInfo(token: string): Promise<User | null>;
}
