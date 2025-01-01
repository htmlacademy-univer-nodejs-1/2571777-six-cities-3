import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { Component, HttpMethod } from '../../../types/index.js';
import { fillDTO } from '../../helpers/index.js';
import { Logger } from '../../logger/logger.interface.js';
import {
  BaseController,
  HttpError,
  PrivateRouteMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../rest/index.js';
import { CommentRdo, CommentService } from '../comment/index.js';
import {
  CreateOfferDto,
  CreateOfferRdo,
  CreateOfferRequest,
  DeleteOfferRdo,
  DeleteOfferRequest,
  EditOfferDto,
  EditOfferRdo,
  EditOfferRequest,
  OfferService,
  ParamOfferId,
  QueryParamsGetAll,
  GetOfferRdo,
  DetailedInformationOfferRequest,
  DetailedInformationOfferRdo
} from './index.js';
import { UserService } from '../user/user-service.interface.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.CommentService)
    private readonly commentService: CommentService,
    @inject(Component.OfferService) private readonly userService: UserService,
  ) {
    super(logger);

    this.logger.info('Register routes for OfferController');

    this.addRoute({
      path: '/getAll',
      method: HttpMethod.Get,
      handler: this.getAll,
      middlewares: [],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [new ValidateObjectIdMiddleware('offerId')],
    });
    this.addRoute({
      path: '/create',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateOfferDto)],
    });
    this.addRoute({
      path: '/edit/:offerId',
      method: HttpMethod.Post,
      handler: this.edit,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(EditOfferDto),
        new ValidateObjectIdMiddleware('offerId'),
      ],
    });
    this.addRoute({
      path: '/detailedInformation/:offerId',
      method: HttpMethod.Get,
      handler: this.detailedInformation,
      middlewares: [new ValidateObjectIdMiddleware('offerId')],
    });
    this.addRoute({
      path: '/getComments/:offerId',
      method: HttpMethod.Get,
      handler: this.getComments,
      middlewares: [new ValidateObjectIdMiddleware('offerId')],
    });
    this.addRoute({
      path: '/delete/:offerId',
      method: HttpMethod.Post,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId')],
    });
    this.addRoute({
      path: '/addToFavorites/:offerId',
      method: HttpMethod.Post,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId')],
    });
    this.addRoute({
      path: '/removeFromFavorites/:offerId',
      method: HttpMethod.Post,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId')],
    });
  }

  public async create(
    { body, tokenPayload }: CreateOfferRequest,
    res: Response
  ): Promise<void> {
    const result = await this.offerService.create({
      ...body,
      author: tokenPayload.id,
    });
    const offer = await this.offerService.findById(result!.id);
    this.created(res, fillDTO(CreateOfferRdo, offer));
  }

  public async edit(
    { params, body, tokenPayload }: EditOfferRequest,
    res: Response
  ): Promise<void> {

    const existOffer = await this.offerService.findById(params.offerId);

    if (!existOffer) {
      throw new HttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Offer with name «${body.name}» does not exists.`,
        'OfferController'
      );
    }

    if (tokenPayload.id.toString() !== existOffer.author._id.toString()) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        `User with id ${tokenPayload.id} does not have access to the Offer with id ${params.offerId}`,
        'OfferController'
      );
    }

    const result = await this.offerService.edit(params.offerId, body);
    this.ok(res, fillDTO(EditOfferRdo, result));
  }

  public async delete({ params, tokenPayload }: DeleteOfferRequest, res: Response): Promise<void> {
    const existOffer = await this.offerService.findById(params.offerId);

    if (!existOffer) {
      throw new HttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Offer with id «${params.offerId}» does not exists.`,
        'OfferController'
      );
    }

    if (tokenPayload.id.toString() !== existOffer.author._id.toString()) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        `User with id ${tokenPayload.id} does not have access to the Offer with id ${params.offerId}`,
        'OfferController'
      );
    }

    const result = await this.offerService.delete(params.offerId);
    this.ok(res, fillDTO(DeleteOfferRdo, result));
  }

  public async getAll(
    { query }: Request<QueryParamsGetAll>,
    res: Response
  ): Promise<void> {
    const limit = query.limit ? +query.limit as number : undefined;
    const city = query.city as string || undefined;
    const orderBy = query.orderBy as string || undefined;

    const result = await this.offerService.findAll(
      limit!,
      city,
      orderBy,
    );
    this.ok(res, fillDTO(GetOfferRdo, result));
  }

  public async detailedInformation(
    { params, body }: DetailedInformationOfferRequest,
    res: Response
  ): Promise<void> {
    const existOffer = await this.offerService.findById(params.offerId);

    if (!existOffer) {
      throw new HttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Offer with name «${body.name}» does not exists.`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(DetailedInformationOfferRdo, existOffer));
  }

  public async getComments(
    { params }: Request<ParamOfferId>,
    res: Response
  ): Promise<void> {
    const comments = await this.commentService.findByOfferId(params.offerId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async getPremiumOffers(
    { query }: Request<{ city: string }>,
    res: Response
  ): Promise<void> {
    const city = query.city;
    if (!city) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'City parameter is required.',
        'OfferController'
      );
    }

    const offers = await this.offerService.findPremium(city as string, 3);
    this.ok(res, fillDTO(GetOfferRdo, offers));
  }

  public async index(_req: Request, res: Response): Promise<void> {
    const offers = await this.offerService.findAll();
    const responseData = fillDTO(CreateOfferRdo, offers);
    this.ok(res, responseData);
  }

  public async addToFavorites(
    { params, tokenPayload }: Request<{ offerId: string }>,
    res: Response
  ): Promise<void> {
    const offerId = params.offerId;
    const userId = tokenPayload.id.toString();

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `User with id ${userId} not found.`,
        'OfferController'
      );
    }

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController'
      );
    }

    if (!user.favorites.includes(offerId)) {
      user.favorites.push(offerId);
      await user.save();
      this.ok(res, { message: 'Offer added to favorites' });
    } else {
      this.ok(res, { message: 'Offer is already in favorites' });
    }
  }

  public async removeFromFavorites(
    { params, tokenPayload }: Request<{ offerId: string }>,
    res: Response
  ): Promise<void> {
    const offerId = params.offerId;
    const userId = tokenPayload.id.toString();

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `User with id ${userId} not found.`,
        'OfferController'
      );
    }

    const offerIndex = user.favorites.indexOf(offerId);
    if (offerIndex !== -1) {
      user.favorites.splice(offerIndex, 1);
      await user.save();
      this.ok(res, { message: 'Offer removed from favorites' });
    } else {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found in favorites.`,
        'OfferController'
      );
    }
  }
}
