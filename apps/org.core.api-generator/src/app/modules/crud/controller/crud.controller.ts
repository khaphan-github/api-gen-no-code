import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { QueryFilterDto } from './query-filter.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('CRUD operator')
@Controller('app/:appid/schema/:schema')
export class CrudController {

  constructor(
    private readonly commandBus: CommandBus,
    private readonly query: QueryBus,
  ) { }
  // Get list
  @Get()
  getData(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Query('page') page: number,
    @Query('size') size: number,
    @Query() query: QueryFilterDto
  ) {

    return {
      method: "get all",
      appId: appId,
      schema: schema
    };
  }

  // getone
  @Get(':id')
  findById(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Param('id') id: string,
  ) {
    return {
      method: "get one",
      appId: appId,
      schema: schema,
      id: id
    };
  }

  @Delete(':id')
  deleteById(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Param('id') id: string
  ) {
    return {
      method: "delete",
      appId: appId,
      schema: schema,
      id: id
    };
  }

  @Post()
  create(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Body() data: object
  ) {

    return {
      statusCode: 1,
      message: appId,
      schema: schema,
      body: data
    };
  }


  @Put(':id')
  update(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Param('id') id: string,
    @Body() data: object
  ) {
    return {
      method: "update",
      appId: appId,
      schema: schema,
      id: id,
      data: data
    };
  }
}
