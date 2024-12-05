import { Comment, User } from '../../models/index.js'; // Импорт модели комментариев
import { CreateCommentDto } from '../../dtoModels/index.js'; // Импорт DTO для создания комментария

export interface ICommentService {
  // Метод для получения списка комментариев для предложения
  getCommentsForOffer(offerId: string): Promise<Comment[]>;

  // Метод для создания нового комментария
  createComment(dto: CreateCommentDto, author: User): Promise<Comment>;
}
