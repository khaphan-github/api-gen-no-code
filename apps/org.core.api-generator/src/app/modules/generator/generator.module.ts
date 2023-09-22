import { CommandHandlers } from './commands';
import { GeneratorController } from './controllers/generator.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { QueryHandlers } from './queries';
import { CqrsModule } from '@nestjs/cqrs';
import { JsonIoService } from '../shared/json.io.service';

@Module({
    imports: [
        CqrsModule,
    ],
    controllers: [GeneratorController,],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        JsonIoService
    ],
})
export class GeneratorModule { }
