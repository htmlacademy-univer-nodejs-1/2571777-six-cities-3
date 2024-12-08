import { types } from '@typegoose/typegoose';
import { Container } from 'inversify';
import { CommentModel, CommentEntity, CommentService, DefaultCommentService } from './index.js';
import { Component } from '../../../types/index.js';
import { Controller } from '../../../libs/rest/index.js';
import { CommentController } from './index.js';

export function createCommentContainer() {
  const container = new Container();

  container.bind<CommentService>(Component.OfferService).to(DefaultCommentService).inSingletonScope();
  container.bind<types.ModelType<CommentEntity>>(Component.UserModel).toConstantValue(CommentModel);
  container.bind<Controller>(Component.OfferController).to(CommentController).inSingletonScope();

  return container;
}
