import { IRentalOfferService } from './IRentalOfferService.js';
import { RentalOffer } from '../../schemas/index.js';
import { injectable } from 'inversify';
import { IRentalOffer } from '../../models/index.js';

@injectable()
export class RentalOfferService implements IRentalOfferService<IRentalOffer> {

  async findById(id: string): Promise<IRentalOffer | null> {
    return RentalOffer.findById(id).exec();
  }

  async findOne(query: object): Promise<IRentalOffer | null> {
    return RentalOffer.findOne(query).exec();
  }

  async create(data: Partial<IRentalOffer>): Promise<IRentalOffer> {
    const newRentalOffer = new RentalOffer(data);
    return newRentalOffer.save();
  }

  async findAll(query: object = {}): Promise<IRentalOffer[]> {
    return RentalOffer.find(query).exec();
  }
}
