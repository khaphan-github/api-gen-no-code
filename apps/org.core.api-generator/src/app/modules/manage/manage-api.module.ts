import { ManageApiService } from './services/manage-api.service';
import { ManageApiController } from './controllers/manage-api.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GeneratorModule } from '../generator/generator.module';
@Module({
    imports: [
        GeneratorModule,
        CqrsModule,
    ],
    controllers: [
        ManageApiController,
    ],
    providers: [
        ManageApiService,],
})
export class ManageApiModule { }
