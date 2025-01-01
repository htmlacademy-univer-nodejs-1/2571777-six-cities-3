import { Type } from 'class-transformer';
import { MinLength, MaxLength, IsDateString, IsEnum, IsUrl, IsArray, ArrayMinSize, ArrayMaxSize, IsBoolean, IsNumber, Min, Max, IsInt, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { City } from '../../../../../src/models/city.enum.js';
import { Convenience } from '../../../../../src/models/convenience.enum.js';
import { HousingType } from '../../../../enums/housing-type.enum.js';
import { OfferValidationMessage } from './offer-messages.js';
import { Coordinate } from './offer.dto.js';

export class CreateOfferDto {
  @MinLength(10, { message: OfferValidationMessage.name.minLength })
  @MaxLength(100, { message: OfferValidationMessage.name.maxLength })
  public name!: string;

  @MaxLength(20, { message: OfferValidationMessage.offerDescription.minLength})
  @MaxLength(20, { message: OfferValidationMessage.offerDescription.maxLength})
  public offerDescription!: string;

  @IsDateString({}, {message: OfferValidationMessage.publicationDate.invalidFormat})
  public publicationDate!: Date;

  @IsEnum(City, { message: OfferValidationMessage.city.invalidId })
  public city!: City;

  @IsUrl({}, {message: OfferValidationMessage.previewUrl.invalidUrl})
  public previewUrl!: string;

  @IsArray({ message: OfferValidationMessage.housingImages.invalidFormat})
  @IsUrl({}, {each: true, message: OfferValidationMessage.housingImages.invalidId})
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

  @IsInt({message: OfferValidationMessage.roomsCount.invalidFormat})
  @Min(1, {message: OfferValidationMessage.roomsCount.minValue})
  @Max(8, {message: OfferValidationMessage.roomsCount.maxValue})
  public roomsCount!: number;

  @IsInt({message: OfferValidationMessage.guestsCount.invalidFormat})
  @Min(1, {message: OfferValidationMessage.guestsCount.minValue})
  @Max(10, {message: OfferValidationMessage.guestsCount.maxValue})
  public guestsCount!: number;

  @IsNumber({}, {message: OfferValidationMessage.guestsCount.invalidFormat})
  @Min(100, {message: OfferValidationMessage.guestsCount.minValue})
  @Max(100_000, {message: OfferValidationMessage.guestsCount.maxValue})
  public rentalCost!: number;

  @IsArray({ message: OfferValidationMessage.housingImages.invalidFormat})
  @IsEnum(Convenience, { each: true, message: OfferValidationMessage.convenienceList.invalidId })
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  public convenienceList!: Convenience[];

  @IsMongoId({message: OfferValidationMessage.author.invalidMongoId})
  public author!: Types.ObjectId;

  @IsInt({message: OfferValidationMessage.guestsCount.invalidFormat})
  @Min(0, {message: OfferValidationMessage.guestsCount.minValue})
  public commentsCount!: number;

  @IsNumber({}, {message: OfferValidationMessage.rating.invalidFormat})
  @Min(0, {message: OfferValidationMessage.rating.minValue})
  @Max(5, {message: OfferValidationMessage.rating.maxValue})
  public averageRating!: number;

  @Type(() => Coordinate)
  public offerCoordinates!: Coordinate;
}

