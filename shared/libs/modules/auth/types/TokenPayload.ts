import { Types } from 'mongoose';

export type TokenPayload = {
  email: string;
  name: string;
  id: Types.ObjectId;
};
