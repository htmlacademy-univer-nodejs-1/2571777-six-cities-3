import { inject, injectable } from 'inversify';
import { types } from '@typegoose/typegoose';
import { Component } from '../../../shared/types/index.js';
import { Logger } from '../../../shared/libs/logger/index.js';
import { AuthenticationService } from './IAuthenticationService.js';
import { UserEntity } from '../../../shared/libs/modules/user/index.js';
import { LoginDto } from '../../dtoModels/loginRequest.dto.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';

@injectable()
export class DefaultAuthenticationService implements AuthenticationService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'defaultSecretKey';
  private readonly redisClient = createClient();

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserModel)
    private readonly userModel: types.ModelType<UserEntity>
  ) {
    this.redisClient.connect().catch((error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  public async login(dto: LoginDto): Promise<{ token: string; message: string }> {
    const user = await this.userModel.findOne({ email: dto.login }).exec();

    if (!user || !(await bcrypt.compare(dto.password, user.getPassword()))) {
      this.logger.warn('Invalid login attempt for username:', dto.login);
      throw new Error('Неверные учетные данные');
    }

    const token = jwt.sign(
      { id: user._id, username: user.name },
      this.jwtSecret,
      { expiresIn: '1h' }
    );

    this.logger.info(`User ${dto.login} logged in`);
    return { token, message: 'Вход успешен' };
  }

  public async logout(token: string): Promise<{ message: string }> {
    try {
      jwt.verify(token, this.jwtSecret);

      await this.redisClient.setEx(`blacklist:${token}`, 3600, 'revoked');

      this.logger.info('Token revoked successfully');
      return { message: 'Сессия завершена' };
    } catch (error) {
      this.logger.error('Token revocation failed:', error as Error);
      throw new Error('Ошибка аутентификации');
    }
  }

  public async getUserInfo(token: string): Promise<UserEntity | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { id: string, username: string };

      const isRevoked = await this.redisClient.get(`blacklist:${token}`);
      if (isRevoked) {
        this.logger.warn('Token is revoked');
        throw new Error('Токен отозван');
      }

      const user = await this.userModel.findById(decoded.id).exec();
      return user;
    } catch (error) {
      this.logger.error('Failed to fetch user info:', error as Error);
      throw new Error('Ошибка аутентификации');
    }
  }
}
