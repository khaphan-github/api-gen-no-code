import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppModule } from '@org.api-generator/core';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    AppModule,
    CqrsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class InteratedAppModule { }
