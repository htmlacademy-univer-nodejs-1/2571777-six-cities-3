import { ParamsDictionary } from 'express-serve-static-core';
import { City } from '../../../../../src/models/index.js';

export type ParamsGetAll = {
    city: City,
    limit: number,
    orderBy: string
} | ParamsDictionary;
