export const Component = {
  RestApplication: Symbol.for('RestApplication'),
  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),
  DB: Symbol.for('DB'),
  UserService : Symbol.for('UserService'),
  OfferService: Symbol.for('OfferService'),
  RentalOfferService: Symbol.for('RentalOfferService'),
  DatabaseClient: Symbol.for('DatabaseClient'),
  UserModel: Symbol.for('UserModel'),
  OfferModel: Symbol.for('OfferModel'),
} as const;
