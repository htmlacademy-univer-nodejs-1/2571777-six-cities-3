import { IsDateString, IsMongoId, IsNumber, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CommentValidationMessage } from './comment.message.js';
import { Types } from 'mongoose';

export class CreateCommentDto {
  @MinLength(5, {message: CommentValidationMessage.text.minLength})
  @MaxLength(1024, {message: CommentValidationMessage.text.maxLength})
  public text!: string;

  @IsDateString({}, {message: CommentValidationMessage.publicationDate.invalidFormat})
  public publicationDate!: Date;

  @IsNumber({}, {message: CommentValidationMessage.rating.invalidFormat})
  @Min(0, {message: CommentValidationMessage.rating.minValue})
  @Max(5, {message: CommentValidationMessage.rating.maxValue})
  public rating!: number;

  @IsMongoId({ message: CommentValidationMessage.authorId.invalidId})
  public author!: Types.ObjectId;

}
