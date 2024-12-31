
import { MinLength, MaxLength, IsDateString, IsEnum, IsUrl, IsArray, ArrayMinSize, ArrayMaxSize, IsBoolean, IsNumber, Min, Max, IsInt } from 'class-validator';
import { City, HousingType } from '../../../../../src/models/index.js';
import { OfferValidationMessage } from './offer-messages.js';

export class GetOfferDto {
  @MinLength(10, { message: OfferValidationMessage.name.minLength })
  @MaxLength(100, { message: OfferValidationMessage.name.maxLength })
  public name!: string;

  @IsDateString({}, {message: OfferValidationMessage.publicationDate.invalidFormat})
  public publicationDate!: Date;

  @IsEnum(City, { message: OfferValidationMessage.city.invalidId })
  public city!: City;

  @IsUrl({}, {message: OfferValidationMessage.previewUrl.invalidUrl})
  public previewUrl!: string;

  @IsArray({ message: OfferValidationMessage.housingImages.invalidFormat})
  @IsUrl({}, {message: OfferValidationMessage.housingImages.invalidId})
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  public housingImages!: string[];

  @IsBoolean({message: OfferValidationMessage.isPremium.invalidId})
  public isPremium!: boolean;

  @IsBoolean({message: OfferValidationMessage.isFavorite.invalidId})
  public isFavorite!: boolean;

  @IsNumber({}, {message: OfferValidationMessage.rating.invalidFormat})
  @Min(0, {message: OfferValidationMessage.rating.minValue})
  @Max(5, {message: OfferValidationMessage.rating.maxValue})
  public rating!: number;

  @IsEnum(HousingType, {message: OfferValidationMessage.housingType.invalidId})
  public housingType!: HousingType;

  @IsNumber({}, {message: OfferValidationMessage.guestsCount.invalidFormat})
  @Min(100, {message: OfferValidationMessage.guestsCount.minValue})
  @Max(100_000, {message: OfferValidationMessage.guestsCount.maxValue})
  public rentalCost!: number;


  @IsInt({message: OfferValidationMessage.guestsCount.invalidFormat})
  @Min(0, {message: OfferValidationMessage.guestsCount.minValue})
  public commentsCount!: number;
}
