import { CrudController } from './controller/crud.controller';
import { Module } from '@nestjs/common';
import { QueryHandlers } from './queries';
import { CommandHandlers } from './commands';
import { CqrsModule } from '@nestjs/cqrs';
import NodeCache from 'node-cache';
import { PostgresConnectorService } from '../../infrastructure/connector/pg-connector.service';

@Module({
    imports: [
        CqrsModule,
    ],
    controllers: [CrudController,],
    providers: [
        ...QueryHandlers,
        ...CommandHandlers,
        NodeCache,
        PostgresConnectorService,
    ],
})
export class CrudModule { }
