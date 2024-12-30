import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { Component, HttpMethod } from '../../../types/index.js';
import { fillDTO } from '../../helpers/index.js';
import { Logger } from '../../logger/logger.interface.js';
import { BaseController, HttpError, ValidateDtoMiddleware, ValidateObjectIdMiddleware } from '../../rest/index.js';
import { CommentRdo, CommentService } from '../comment/index.js';
import {
  CreateOfferDto,
  CreateOfferRdo,
  CreateOfferRequest,
  DeleteOfferDto,
  EditOfferDto,
  EditOfferRequest,
  OfferService,
  ParamOfferId,
  ParamsGetAll
} from './index.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
        @inject(Component.Logger) protected readonly logger: Logger,
        @inject(Component.OfferService) private readonly offerService: OfferService,
        @inject(Component.CommentModel) private readonly commentService: CommentService,
  ){
    super(logger);

    this.logger.info('Register routes for OfferController');

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [new ValidateObjectIdMiddleware('offerId')]});
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateOfferDto)]
    });
    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.getAll,
      middlewares: [new ValidateObjectIdMiddleware('offerId')]
    });
  }

  public async create({ body, tokenPayload }: CreateOfferRequest, res: Response): Promise<void> {
    const result = await this.offerService.create({ ...body, author: tokenPayload.id });
    const offer = await this.offerService.findById(result.id);
    this.created(res, fillDTO(CreateOfferRdo, offer));
  }

  public async edit(
    { body }: EditOfferRequest,
    res: Response): Promise<void> {
    const existOffer = await this.offerService.findById(body.id);

    if (!existOffer) {
      throw new HttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Category with name «${body.name}» does not exists.`,
        'CategoryController'
      );
    }

    const result = await this.offerService.edit(body.id, body);
    this.ok(res, fillDTO(EditOfferDto, result));
  }

  public async delete(
    offerId: string,
    res: Response): Promise<void> {
    const existOffer = await this.offerService.findById(offerId);

    if (!existOffer) {
      throw new HttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Category with id «${offerId}» does not exists.`,
        'CategoryController'
      );
    }

    const result = await this.offerService.delete(offerId);
    this.ok(res, fillDTO(DeleteOfferDto, result));
  }

  public async getAll({ params } : Request<ParamsGetAll>,
    res: Response): Promise<void> {
    const result = await this.offerService.findAll(params.city, +params.limit, params.orderBy);
    this.ok(res, fillDTO(CreateOfferDto, result));
  }

  public async getComments({ params }: Request<ParamOfferId>, res: Response): Promise<void> {
    const comments = await this.commentService.findByOfferId(params.offerId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async index(_req: Request, res: Response): Promise<void> {
    const offers = await this.offerService.findAll();
    const responseData = fillDTO(CreateOfferRdo, offers);
    this.ok(res, responseData);
  }
}
