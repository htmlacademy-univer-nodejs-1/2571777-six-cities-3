import { Request } from 'express';
import { RequestBody, RequestParams } from '../../../rest/index.js';
import { DetailedInformationOfferRdo } from '../index.js';

export type DetailedInformationOfferRequest = Request<RequestParams, RequestBody, DetailedInformationOfferRdo>;
