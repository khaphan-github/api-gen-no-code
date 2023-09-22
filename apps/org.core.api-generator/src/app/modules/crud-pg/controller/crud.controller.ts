import { Body, Controller, Delete, Get, Options, Param, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { QueryParamDataDto, RequestParamDataDto } from './query-filter.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateDataCommand } from '../commands/create..command';
import { GetDataQuery } from '../queries/get-one.query';
import { ConditionObject } from '../../../domain/db.query.domain';

@ApiTags('CRUD operator')
@Controller('app/:appid/schema/:schema')
export class CrudController {

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }
  // Get list
  // @Get()
  // getData(
  //   @Param('appid') appId: string,
  //   @Param('schema') schema: string,
  //   @Query('page') page: number,
  //   @Query('size') size: number,
  //   @Query() query: QueryFilterDto
  // ) {

  //   return {
  //     method: "get all",
  //     appId: appId,
  //     schema: schema
  //   };
  // }

  @Post('query')
  @ApiBody({
    schema: {
      example: {
        condition: {
          "or": [
            {
              "and": [
                { "auth": "isAuth" },
                { "method": "POST" }
              ]
            },
            {
              "or": [
                { "method": "POST" },
                { "method": "GET" }
              ]
            }
          ]
        }
      }
    }
  })
  findById(
    @Param() requestParamDataDto: RequestParamDataDto,
    @Query() QueryParamDataDto: QueryParamDataDto,
    @Body() condition: ConditionObject
  ) {
    return this.queryBus.execute(new GetDataQuery(requestParamDataDto, QueryParamDataDto, condition));
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
  @ApiBody({
    schema: {
      example: {
        product_name: 'Sản phẩm test 1',
        description: 'Đây là sản phẩm có năng lực thần kỳ'
      }
    }
  })
  create(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Body() data: object
  ) {
    return this.commandBus.execute(new CreateDataCommand(appId, schema, data));
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
