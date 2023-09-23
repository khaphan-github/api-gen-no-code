import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { QueryParamDataDto, RequestParamDataDto } from './query-filter.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateDataCommand } from '../commands/create..command';
import { GetDataQuery } from '../queries/get-one.query';
import { DeleteDataCommand } from '../commands/delete.command';
import { GetSchemaStructureQuery } from '../queries/get-schema-structure.query';
import { ConditionObject } from '../../../domain/relationaldb.query-builder';
import { UpdateDataCommand } from '../commands/update.command';

@ApiTags('CRUD operator')
@Controller('app/:appid/schema/:schema')
export class CrudController {

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

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
  query(
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
    @Param('id') id: number
  ) {
    return this.commandBus.execute(new DeleteDataCommand(appId, schema, id));
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
    return this.commandBus.execute(new UpdateDataCommand(appId, schema, id, data));
  }

  @Get('structure')
  getSchemaInfo(
    @Param('appid') appId: string,
    @Param('schema') schema: string
  ) {
    return this.queryBus.execute(new GetSchemaStructureQuery(appId, schema));
  }
}
