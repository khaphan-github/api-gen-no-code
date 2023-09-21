import { CommandHandlers } from './commands';
import { GeneratorController } from './controllers/generator.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { QueryHandlers } from './queries';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule,
    ],
    controllers: [GeneratorController,],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
    ],
})
export class GeneratorModule { }
