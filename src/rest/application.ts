import cors from 'cors';
import express, { Express } from 'express';
import { inject, injectable } from 'inversify';
import { Config } from '../../shared/libs/config/index.js';
import { RestSchema } from '../../shared/libs/config/rest.schema.js';
import { DatabaseClient } from '../../shared/libs/database-client/index.js';
import {
  getFullServerPath,
  getMongoURI,
} from '../../shared/libs/helpers/index.js';
import { Logger } from '../../shared/libs/logger/index.js';
import { Controller, ExceptionFilter } from '../../shared/libs/rest/index.js';
import { ParseTokenMiddleware } from '../../shared/libs/rest/middleware/parse-token.middleware.js';
import { Component } from '../../shared/types/index.js';
import { STATIC_UPLOAD_ROUTE } from './rest.constant.js';

@injectable()
export class RestApplication {
  private server: Express;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient)
    private readonly databaseClient: DatabaseClient,
    @inject(Component.ExceptionFilter)
    private readonly appExceptionFilter: ExceptionFilter,
    @inject(Component.UserController)
    private readonly userController: Controller,
    @inject(Component.OfferController)
    private readonly offerController: Controller,
    @inject(Component.CommentController)
    private readonly commentController: Controller,
    @inject(Component.AuthExceptionFilter)
    private readonly authExceptionFilter: ExceptionFilter,
    @inject(Component.HttpErrorExceptionFilter)
    private readonly httpErrorExceptionFilter: ExceptionFilter,
    @inject(Component.ValidationExceptionFilter)
    private readonly validationExceptionFilter: ExceptionFilter
  ) {
    this.server = express();
  }

  private async _initDb() {
    this.logger.info(this.config.get('DB_USER'));
    this.logger.info(this.config.get('DB_PASSWORD'));
    this.logger.info(this.config.get('DB_HOST'));
    this.logger.info(this.config.get('DB_PORT').toString());
    this.logger.info(this.config.get('DB_NAME'));
    const mongoUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME')
    );

    this.logger.info(mongoUri);

    await this.databaseClient.connect(mongoUri);
  }

  private async _initMiddleware() {
    const authenticateMiddleware = new ParseTokenMiddleware(
      this.config.get('JWT_SECRET')
    );
    this.server.use(express.json());
    this.server.use(
      STATIC_UPLOAD_ROUTE,
      express.static(this.config.get('UPLOAD_DIRECTORY'))
    );
    this.server.use(
      STATIC_UPLOAD_ROUTE,
      express.static(this.config.get('STATIC_DIRECTORY_PATH'))
    );
    this.server.use(
      authenticateMiddleware.execute.bind(authenticateMiddleware)
    );
    this.server.use(cors());
  }

  private async _initExceptionFilters() {
    this.server.use(
      this.authExceptionFilter.catch.bind(this.authExceptionFilter)
    );
    this.server.use(
      this.validationExceptionFilter.catch.bind(this.validationExceptionFilter)
    );
    this.server.use(
      this.httpErrorExceptionFilter.catch.bind(this.httpErrorExceptionFilter)
    );
    this.server.use(
      this.appExceptionFilter.catch.bind(this.appExceptionFilter)
    );
  }

  private async _initControllers() {
    this.server.use('/offers', this.offerController.router);
    this.server.use('/users', this.userController.router);
    this.server.use('/comments', this.commentController.router);
  }

  private async _initServer() {
    const port = this.config.get('PORT');
    this.server.listen(port);
  }

  public async init() {
    this.logger.info('Application initialization');

    this.logger.info('Init database');
    await this._initDb();
    this.logger.info('Init database completed');

    this.logger.info('Init app-level middleware');
    await this._initMiddleware();
    this.logger.info('App-level middleware initialization completed');

    this.logger.info('Init controllers');
    await this._initControllers();
    this.logger.info('Controllers initialization completed');

    this.logger.info('Init exception-filter');
    await this._initExceptionFilters();
    this.logger.info('Init exception-filter completed');

    this.logger.info('Try to init server...');
    await this._initServer();
    this.logger.info(
      `Server started on ${getFullServerPath(
        this.config.get('HOST'),
        this.config.get('PORT')
      )}`
    );
  }
}
