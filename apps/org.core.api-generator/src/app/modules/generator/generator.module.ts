import { CommandHandlers } from './commands';
import { GeneratorController } from './controllers/generator.controller';
import { Module } from '@nestjs/common';
import { QueryHandlers } from './queries';
import { CqrsModule } from '@nestjs/cqrs';
import { JsonIoService } from '../shared/json.io.service';
import NodeCache from 'node-cache';
import { GeneratorService } from './services/generator.service';
import { GenerateAPISagas } from './sagas/generate-api.saga';
import { ExecutedSQLScriptEventHandler } from './events/execute-sql-create-db.event';
import { HttpModule } from '@nestjs/axios';
import { SQLTransformerProxy } from './proxy/sql.transformer.proxy';

@Module({
    imports: [
        CqrsModule,
        HttpModule,
    ],
    controllers: [GeneratorController,],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        JsonIoService,
        NodeCache,
        GeneratorService,

        GenerateAPISagas,
        ExecutedSQLScriptEventHandler,
        SQLTransformerProxy,
    ],
})
export class GeneratorModule { }
