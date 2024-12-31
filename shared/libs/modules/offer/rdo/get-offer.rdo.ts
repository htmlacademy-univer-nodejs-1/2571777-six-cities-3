import { Expose } from 'class-transformer';
import { City, HousingType } from '../../../../../src/models/index.js';

export class GetOfferRdo {
  @Expose()
  public name!: string;

  @Expose()
  public publicationDate!: Date;

  @Expose()
  public city!: City;

  @Expose()
  public previewUrl!: string;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public housingType!: HousingType;

  @Expose()
  public rentalCost!: number;

  @Expose()
  public commentsCount!: number;
}
