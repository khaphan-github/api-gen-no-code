import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { GetConfigQuery } from '../queries/getconfig.query';
import { CreateSchemaCommand } from '../commands/create-schema.command';
import { DropSchemaCommand } from '../commands/drop-schema.command';
import { ExecuteScriptDto } from '../dto/script.dto';
import { CreateAppDto } from '../dto/create-app.dto';
import { CreateAppCommand } from '../commands/create-app.command';

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

  @Delete('app/:appid/schema/:schema')
  dropTable(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
  ) {
    return this.commandBus.execute(new DropSchemaCommand(appId, schema));
  }
  @Put('app/:appid/config')
  async updateConfig(
    @Param('appid') appId: string,
    @Body() dbConfig: any,
  ) {
    throw new Error('update app config');
  }


  @Post('app/:appid/script')
  executeCreateDbScript(@Body() script: ExecuteScriptDto) {
    throw new Error('Create database using script')
  }

  @Post('app')
  createApp(@Body() createAppDto: CreateAppDto) {
    return this.commandBus.execute(new CreateAppCommand(createAppDto));
  }
}
