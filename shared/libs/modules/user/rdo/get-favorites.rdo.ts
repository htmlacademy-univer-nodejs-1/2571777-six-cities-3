import { Expose } from 'class-transformer';

export class GetFavoritesRdo {
  @Expose()
  public favorites!: string[];
}
