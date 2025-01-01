import { Expose, Type } from 'class-transformer';
import { CreateUserRdo } from '../../user/index.js';

export class CommentRdo {
  @Expose()
  public test!: string;

  @Expose()
  public publicationDate!: string;

  @Expose()
  public rating!: number;

  @Expose()
  @Type(() => CreateUserRdo)
  public author!: CreateUserRdo;
}
