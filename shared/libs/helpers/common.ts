import { ClassConstructor, plainToInstanse } from 'class-transformer';

export function fillDTO<T, V>(someDto: ClassConstructor<T>, plainObject: V) {
    return plainToInstanse(someDto, plainObject, { excludeExtraneousValues: true});
}

export function createErrorObject(message: string) {
    return {
      error: message,
    };
  }