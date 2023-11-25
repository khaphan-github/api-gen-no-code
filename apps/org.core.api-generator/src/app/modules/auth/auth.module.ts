import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GeneratorModule } from '../generator/generator.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    GeneratorModule,
    CqrsModule,
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
  ],
})
export class ManageApiModule { }
