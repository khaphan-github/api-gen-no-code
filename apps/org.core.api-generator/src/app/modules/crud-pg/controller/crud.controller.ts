import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { QueryParamDataDto, RequestParamDataDto } from './query-filter.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ConditionObject } from '../../../domain/relationaldb.query-builder';
import { CrudService } from '../services/crud-pg.service';
import { ResponseBase } from '../../../infrastructure/format/response.base';

@ApiTags('CRUD operator')
@Controller('app/:appid/schema/:schema')
export class CrudController {

  constructor(
    private readonly service: CrudService,
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
  @HttpCode(200)
  async query(
    @Param() requestParamDataDto: RequestParamDataDto,
    @Query() queryParamDataDto: QueryParamDataDto,
    @Body() conditions?: ConditionObject
  ) {
    const queryResult = await this.service.query(requestParamDataDto, queryParamDataDto, conditions);
    return new ResponseBase(200, 'Query success', queryResult);
  }

  @Delete(':id')
  deleteById(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Param('id') id: number
  ) {
    return this.service.delete(appId, schema, id);
  }

  @Post()
  @ApiBody({
    schema: {
      example: [{
        product_name: 'Sản phẩm test 1',
        description: 'Đây là sản phẩm có năng lực thần kỳ'
      }]
    }
  })
  insert(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Body() data: Array<object>
  ) {
    return this.service.insert(appId, schema, data);
  }

  @Put(':id')
  update(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Param('id') id: string,
    @Body() data: object
  ) {
    return this.service.update(appId, schema, id, data);
  }

  @Get('structure')
  getSchemaInfo(
    @Param('appid') appId: string,
    @Param('schema') schema: string
  ) {
    return this.service.getSchemaStructure(appId, schema);
  }
}
