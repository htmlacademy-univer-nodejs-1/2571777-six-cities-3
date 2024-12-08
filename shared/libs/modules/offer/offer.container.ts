import { types } from '@typegoose/typegoose';
import { Container } from 'inversify';
import { OfferModel, OfferEntity, OfferService, DefaultOfferService } from './index.js';
import { Component } from '../../../types/index.js';
import { Controller } from '../../../libs/rest/index.js';
import { OfferController } from './index.js';

export function createOfferContainer() {
  const container = new Container();

  container.bind<OfferService>(Component.OfferService).to(DefaultOfferService).inSingletonScope();
  container.bind<types.ModelType<OfferEntity>>(Component.UserModel).toConstantValue(OfferModel);
  container.bind<Controller>(Component.OfferController).to(OfferController).inSingletonScope();

  return container;
}
