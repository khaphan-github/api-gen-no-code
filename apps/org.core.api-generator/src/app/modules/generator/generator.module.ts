import { CommandHandlers } from './commands';
import { GeneratorController } from './controllers/generator.controller';
import { Module } from '@nestjs/common';
import { QueryHandlers } from './queries';
import { CqrsModule } from '@nestjs/cqrs';
import { JsonIoService } from '../shared/json.io.service';
import { PostgresConnectorService } from '../../infrastructure/connector/pg-connector.service';
import NodeCache from 'node-cache';

@Module({
    imports: [
        CqrsModule,
    ],
    controllers: [GeneratorController,],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        JsonIoService,
        NodeCache,
        PostgresConnectorService,
    ],
})
export class GeneratorModule { }
