import { injectable } from 'inversify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUser } from '../../models/index.js';
import { User } from '../../schemas/index.js';
import { createClient } from 'redis';

@injectable()
export class AuthenticationService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'defaultSecretKey';
  private readonly redisClient = createClient();

  constructor() {
    this.redisClient.connect();
  }

  async login(username: string, password: string): Promise<{ token: string; message: string }> {
    const user = await User.findOne({ username }).exec();
    if (!user) {
      throw new Error('Неверные учетные данные');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Неверные учетные данные');
    }

    const token = jwt.sign({ id: user._id, username: user.name }, this.jwtSecret, {
      expiresIn: '1h',
    });

    return { token, message: 'Вход успешен' };
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      jwt.verify(token, this.jwtSecret) as { id: string; username: string };

      await this.redisClient.setEx(`blacklist:${token}`, 3600, 'revoked');

      return { message: 'Сессия завершена' };
    } catch (error) {
      throw new Error('Ошибка аутентификации');
    }
  }

  async getUserInfo(token: string): Promise<IUser | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { id: string; username: string };

      const reply = await this.redisClient.get(`blacklist:${token}`);

      if (reply) {
        throw new Error('Токен отозван');
      }

      const user = await User.findById(decoded.id).exec();
      return user;
    } catch (error) {
      throw new Error('Ошибка аутентификации');
    }
  }
}
