import { CreateCommentDto, CommentEntity } from './index.js';
import { DocumentType } from '@typegoose/typegoose';

export interface CommentService {
  create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>>;
  findById(id: string): Promise<DocumentType<CommentEntity> | null>;
  findAll(): Promise<DocumentType<CommentEntity>[]>;
  findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]>
}
