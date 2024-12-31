import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController, HttpError, PrivateRouteMiddleware, ValidateDtoMiddleware, ValidateObjectIdMiddleware } from '../../rest/index.js';
import { Logger } from '../../logger/logger.interface.js';
import { Component, HttpMethod } from '../../../types/index.js';
import { CommentDto, CommentRdo, CommentService } from './index.js';
import { fillDTO } from '../../helpers/index.js';
import { StatusCodes } from 'http-status-codes';
import { CreateCommentRequest } from './requests/create-comment-request.js';
import { OfferService } from '../offer/index.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
        @inject(Component.Logger) protected readonly logger: Logger,
        @inject(Component.CommentService) private readonly commentService: CommentService,
        @inject(Component.OfferService) private readonly offerService: OfferService
  ){
    super(logger);

    this.logger.info('Register routes for OfferController');

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [new ValidateObjectIdMiddleware('offerId'), new ValidateDtoMiddleware(CommentDto)]
    });
    this.addRoute({
      path: '/create/offer/:offerId',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CommentDto),
        new ValidateObjectIdMiddleware('offerId')]
    });
  }

  public async create(
    { params, body, tokenPayload }: CreateCommentRequest,
    res: Response
  ): Promise<void> {
    if (! await this.offerService.exists(params.offerId)) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${params.offerId} not found.`,
        'CommentController'
      );
    }
    const comment = await this.commentService.create({ ...body, author: tokenPayload.id });
    await this.offerService.incCommentCount(params.offerId);
    this.created(res, fillDTO(CommentRdo, comment));
  }

  public async findById(commentId: string, res: Response): Promise<void> {
    const comment = await this.commentService.findById(commentId);

    if (!comment) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id «${commentId}» not found.`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(CommentDto, comment));

  }

  public async index(_req: Request, res: Response): Promise<void> {
    const comments = await this.commentService.findAll();
    const responseData = fillDTO(CommentDto, comments);
    this.ok(res, responseData);
  }
}
