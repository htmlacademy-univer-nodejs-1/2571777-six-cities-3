import { Expose } from 'class-transformer';
import { UserType } from '../../../../enums/index.js';

export class CreateUserRdo {
  @Expose()
  public email!: string ;

  @Expose()
  public avatar!: string;

  @Expose()
  public name!: string;

  @Expose()
  public type = UserType.Basic;

  @Expose()
  public favorites!: string[];
}
