import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const document = SwaggerModule.createDocument(app, CONFIG_SWAGGER);
  SwaggerModule.setup('swagger', app, document);

  app.enableCors(); // only develop env'

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const globalPrefix = '';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}${globalPrefix}`);
}

bootstrap();

export const CONFIG_SWAGGER = new DocumentBuilder()
  .setTitle('API GENNERATOR SERVICE - NO CODE')
  .setDescription(``)
  .setVersion('2.0')
  .addBearerAuth()
  .build();
