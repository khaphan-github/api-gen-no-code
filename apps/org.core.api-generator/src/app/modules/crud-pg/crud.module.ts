import { CrudController } from './controller/crud.controller';
import { Module } from '@nestjs/common';
import { QueryHandlers } from './queries';
import { CommandHandlers } from './commands';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
    imports: [
        CqrsModule,
    ],
    controllers: [CrudController,],
    providers: [
        ...QueryHandlers,
        ...CommandHandlers,
    ],
})
export class CrudModule { }
