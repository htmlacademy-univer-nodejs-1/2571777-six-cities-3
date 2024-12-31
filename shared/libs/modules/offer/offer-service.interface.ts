import { DocumentExists } from '../../../types/document-exists.interface.js';
import { CreateOfferDto, EditOfferDto, OfferEntity } from './index.js';
import { DocumentType } from '@typegoose/typegoose';

export interface OfferService extends DocumentExists {
  create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>>;
  findById(id: string): Promise<DocumentType<OfferEntity> | null>;
  findAll(limit?: number, city?: string, sortBy?: string): Promise<DocumentType<OfferEntity>[]>;
  findPremium(city: string, limit?: number): Promise<DocumentType<OfferEntity>[]>;
  edit(offerId: string, dto: EditOfferDto): Promise<DocumentType<OfferEntity> | null>;
  delete(offerId: string): Promise<DocumentType<OfferEntity>>;
  exists(documentId: string): Promise<boolean>;
  incCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null>;
}
