import * as fs from 'node:fs';
import * as readline from 'node:readline';
import { HousingType } from '../../shared/enums/housing-type.enum.js';
import { City } from '../models/city.enum.js';
import { Convenience } from '../models/convenience.enum.js';
import { CreateOfferDto } from '../../shared/libs/modules/offer/index.js';

function parseEnum<T>(enumObj: T, key: string): T[keyof T] {
  return enumObj[key as keyof T];
}

export class TSVReader {
  private readStream: fs.ReadStream;
  private getNextLine: AsyncIterableIterator<string>;
  private countRentalOffers: number;

  constructor(filePath: string) {
    this.readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    this.getNextLine = readline
      .createInterface({
        input: this.readStream,
        crlfDelay: Infinity,
      })[Symbol.asyncIterator]();
    this.countRentalOffers = 0;
  }

  public async getRentalOffer(): Promise<[CreateOfferDto, number] | undefined> {
    const { value, done } = await this.getNextLine.next();
    if (done) {
      this.readStream.close();
      return undefined;
    }
    this.countRentalOffers++;
    const rentalOffer = this.parseRentalOffer(value.split('\t'));
    return [rentalOffer, this.countRentalOffers];
  }

  public parseRentalOffer(fields: string[]): CreateOfferDto {
    return {
      id: fields[1],
      name: fields[2],
      offerDescription: fields[3],
      publicationDate: new Date(fields[4]),
      city: parseEnum(City, fields[5]),
      previewUrl: fields[6],
      housingImages: fields[7] as unknown as string[],
      isPremium: fields[8] === 'true',
      isFavorite: fields[9] === 'true',
      rating: parseFloat(fields[10]),
      housingType: parseEnum(HousingType, fields[11]),
      roomsCount: parseInt(fields[12], 10),
      guestsCount: parseInt(fields[13], 10),
      rentalCost: parseInt(fields[14], 10),
      convenienceList: fields[14].split(';') as Convenience[],
      author: fields[15],
      commentsCount: parseInt(fields[16], 10),
      averageRating: parseFloat(fields[17]),
      offerCoordinates: {
        latitude: parseFloat(fields[18].split(', ')[0]),
        longitude: parseFloat(fields[18].split(', ')[1]),
      }
    };
  }
}
