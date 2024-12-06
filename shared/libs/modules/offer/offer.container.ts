import { types } from '@typegoose/typegoose';
import { Container } from 'inversify';
import { OfferModel, OfferEntity, OfferService, DefaultOfferService } from './index.js';
import { Component } from '../../../types/index.js';

export function createOfferContainer() {
  const container = new Container();

  container.bind<OfferService>(Component.OfferService).to(DefaultOfferService).inSingletonScope();
  container.bind<types.ModelType<OfferEntity>>(Component.UserModel).toConstantValue(OfferModel);

  return container;
}
