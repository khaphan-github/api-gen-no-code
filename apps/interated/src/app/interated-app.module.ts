import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppModule } from '@org.api-generator/core';

@Module({
  imports: [
    AppModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class InteratedAppModule { }
