import { DocumentType, types } from '@typegoose/typegoose';
import { inject, injectable } from 'inversify';
import { Component } from '../../../types/index.js';
import { Logger } from '../../logger/index.js';
import { CreateOfferDto, EditOfferDto, OfferEntity, OfferService } from './index.js';
//import { CommentService } from '../comment/index.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
    //@inject(Component.CommentService) private readonly commentService: CommentService
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.name}`);
    return result;
  }

  public async findById(id: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findById(id).populate('author');
  }

  public async findAll(limit = 60, city?: string, sortBy: 'date' | 'price' = 'date'): Promise<DocumentType<OfferEntity>[]> {
    const filter = city ? { city } : {};
    return this.offerModel.find(filter).sort({ [sortBy]: 1 }).limit(limit).exec();
  }

  public async findPremium(city: string, limit = 3): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ city, isPremium: true })
      .sort({ date: -1 })
      .limit(limit)
      .exec();
  }

  public async edit(offerId: string, dto: EditOfferDto): Promise<DocumentType<OfferEntity> | null> {
    const offer = await this.offerModel.findByIdAndUpdate(offerId, dto, { new: true }).exec();
    if (!offer) {
      throw new Error('Offer not found');
    }

    this.logger.info(`Offer ${offerId} updated.`);
    return await this.findById(offerId);
  }

  public async delete(offerId: string): Promise<DocumentType<OfferEntity>> {
    const offer = await this.offerModel.findByIdAndDelete(offerId).exec();
    if (!offer) {
      throw new Error('Offer not found');
    }

    this.logger.info(`Offer ${offerId} deleted.`);
    return offer;
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.offerModel
      .exists({_id: documentId})) !== null;
  }

  public async incCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, {'$inc': {
        commentCount: 1,
      }}).exec();
  }
}
