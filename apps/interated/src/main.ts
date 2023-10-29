/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { InteratedAppModule } from './app/interated-app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(InteratedAppModule);

  app.useStaticAssets(join(__dirname, './assets/public'));
  app.setBaseViewsDir(join(__dirname, './assets/public/views'));
  app.setViewEngine('hbs');
  const globalPrefix = 'api/v1/';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
