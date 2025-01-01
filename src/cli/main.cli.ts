#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'reflect-metadata';
import { PinoLogger } from '../../shared/libs/logger/index.js';
import { TSVReader } from './TSVReader.js';
import { TSVWriter } from './TSVWriter.js';
import { RentalOffer } from '../models/rental-offer.js';
import { getMongoURI } from '../../shared/libs/helpers/index.js';
import { DEFAULT_DB_PORT } from './command.constants.js';
import { DefaultOfferService, OfferEntity, OfferModel } from '../../shared/libs/modules/offer/index.js';
import { types } from '@typegoose/typegoose';
import { MongoDatabaseClient } from '../../shared/libs/database-client/mongo.database-client.js';

const filename = fileURLToPath(import.meta.url);
const Dirname = dirname(filename);

const logger = new PinoLogger();
const offerModel: types.ModelType<OfferEntity> = OfferModel;
const rentalOfferService = new DefaultOfferService(logger, offerModel);


const version = JSON.parse(
  fs.readFileSync(path.join(Dirname, '../../package.json'), 'utf-8')
).version;

const showHelp = () => {
  console.log(chalk.blue('Список команд:'));
  console.log(`${chalk.green('--help:')} выводит информацию о командах`);
  console.log(`${chalk.green('--version:')} выводит версию приложения`);
  console.log(
    `${chalk.green('--import <filename>:')} импортирует данные из TSV-файла`
  );
  console.log(
    `${chalk.green('--generate <n> <filename> <url>:')} генерирует произвольное количество тестовые данных`
  );
};

const importData = async (
  filePath: string,
  login: string,
  password: string,
  host: string,
  dbname: string
): Promise<void> => {
  const reader: TSVReader = new TSVReader(filePath);
  const databaseClient = new MongoDatabaseClient(logger);
  const uri = getMongoURI(login, password, host, DEFAULT_DB_PORT, dbname);
  await databaseClient.connect(uri);
  let readNext = true;

  while (readNext) {
    const result = await reader.getRentalOffer();
    if (!result) {
      readNext = false;
      continue;
    }
    const [rentalOffer, countRentalOffers] = result;

    try {
      const createResult = await rentalOfferService.create(rentalOffer);
      logger.info(
        chalk.green(
          `Успешно импортированы : ${countRentalOffers} предложений аренды`
        ),
        createResult
      );
    } catch (error) {
      logger.error(
        'Ошибка при сохранении предложения аренды в базу данных:',
        error as Error
      );
    }
  }
};

const generateData = async (
  countRentalOffers: number,
  filePath: string,
  url: string
): Promise<void> => {
  try {
    const response = await axios.get<RentalOffer[]>(url);
    const availableData = response.data;

    const tsvGenerator = new TSVWriter(filePath);
    for (let i = 0; i < countRentalOffers; i++) {
      const randomItem =
        availableData[Math.floor(Math.random() * availableData.length)];
      tsvGenerator.addRentalOffer(randomItem);
    }
    tsvGenerator.end();
  } catch (error) {
    console.error('Ошибка при получении данных с JSON-сервера:', error);
  }
};

const [, , command, ...args] = process.argv;
switch (command) {
  case '--help':
    showHelp();
    break;
  case '--version':
    console.log(chalk.yellow(`Версия приложения: ${version}`));
    break;
  case '--import':
    {
      const [filePath, login, password, host, dbname] = args;
      importData(filePath, login, password, host, dbname);
    }
    break;
  case '--generate': {
    console.log(args);
    const [nArg, type, filePath] = args;
    console.log(nArg, type, filePath);
    const countRentalOffers: number = parseInt(nArg, 10);
    generateData(countRentalOffers, type, filePath);
    break;
  }
  default:
    showHelp();
}
