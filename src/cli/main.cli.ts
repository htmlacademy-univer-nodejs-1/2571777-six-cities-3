#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'reflect-metadata';
import { Logger } from '../../shared/libs/logger/index.js';
import { Component } from '../../shared/types/component.js';
import { TSVReader } from './TSVReader.js';
import { TSVWriter } from './TSVWriter.js';
import { appContainer } from '../main.rest.js';
import { RentalOffer } from '../models/rental-offer.js';
import { getMongoURI } from '../../shared/libs/helpers/index.js';
import { DEFAULT_DB_PORT, DEFAULT_USER_PASSWORD } from './command.constants.js';
import { DatabaseClient } from '../../shared/libs/database-client/database-client.interface.js';
import { DefaultOfferService } from '../../shared/libs/modules/offer/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rentalOfferService = appContainer.get<DefaultOfferService>(
  Component.RentalOfferService
);
const logger = appContainer.get<Logger>(Component.Logger);

const version = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')
).version;

const showHelp = () => {
  console.log(chalk.blue('Список команд:'));
  console.log(`${chalk.green('--help:')} выводит информацию о командах`);
  console.log(`${chalk.green('--version:')} выводит версию приложения`);
  console.log(
    `${chalk.green('--import <filename>:')} импортирует данные из TSV-файла`
  );
};

const importData = async (
  filePath: string,
  login: string,
  password: string,
  host: string,
  dbname: string,
  salt: string
): Promise<void> => {
  const reader: TSVReader = new TSVReader(filePath);
  const databaseClient = appContainer.get<DatabaseClient>(Component.DatabaseClient);
  const uri = getMongoURI(login, password, host, DEFAULT_DB_PORT, dbname);
  await databaseClient.connect(uri);
  let readNext = true;

  while (readNext) {
    const result = await reader.getRentalOffer();
    if (!result) {
      readNext = false;
      continue;
    }
    logger.info(JSON.stringify(result));
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
      const [filePath, login, password, host, dbname, salt] = args;
      importData(filePath, login, password, host, dbname, salt);
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
