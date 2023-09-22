import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { GetConfigQuery } from '../queries/getconfig.query';
import { CreateSchemaCommand } from '../commands/create-schema.command';

@ApiTags('Api Generator')
@Controller('generator')
export class GeneratorController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) { }

  @Get('config')
  getConfig() {
    return this.queryBus.execute(new GetConfigQuery());
  }

  @Post()
  createDb(
    @Body() createSchemaCommand: CreateSchemaCommand
  ) {
    return this.commandBus.execute(createSchemaCommand);
  }
}
