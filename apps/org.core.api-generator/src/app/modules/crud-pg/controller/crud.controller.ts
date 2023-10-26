import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { QueryParamDataDto, RequestParamDataDto } from './query-filter.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ConditionObject } from '../../../domain/relationaldb.query-builder';
import { CrudService } from '../services/crud-pg.service';
import { ErrorBase, ResponseBase } from '../../../infrastructure/format/response.base';

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
  @HttpCode(400)
  async query(
    @Param() requestParamDataDto: RequestParamDataDto,
    @Query() queryParamDataDto: QueryParamDataDto,
    @Body() conditions?: ConditionObject
  ) {
    try {
      const queryResult = await this.service.query(requestParamDataDto, queryParamDataDto, conditions);
      return new ResponseBase(200, 'Query success', queryResult);
    } catch (error) {
      return new ErrorBase(error);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteById(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Param('id') id: number,
    @Query('id_column') column: string
  ) {
    try {
      const deleteResult = await this.service.delete(appId, schema, id, column);
      return new ResponseBase(204, 'Delete success', deleteResult);
    } catch (error) {
      return new ErrorBase(error);
    }
  }

  @Post()
  @HttpCode(201)
  @ApiBody({
    schema: {
      example: [{
        product_name: 'Sản phẩm test 1',
        description: 'Đây là sản phẩm có năng lực thần kỳ'
      }]
    }
  })
  async insert(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Body() data: Array<object>
  ) {
    try {
      const insertResult = await this.service.insert(appId, schema, data);
      return new ResponseBase(201, 'Insert success', insertResult);
    } catch (error) {
      return new ErrorBase(error);
    }
  }

  @Put(':id')
  @HttpCode(200)
  @ApiBody({
    schema: {
      example: {
        product_name: 'Sản phẩm test 1',
        description: 'Đây là sản phẩm có năng lực thần kỳ'
      }
    }
  })
  async update(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Param('id') id: string,
    @Query('id_column') idColumn: string,
    @Body() data: object
  ) {
    try {
      const updateResult = await this.service.update(appId, schema, id, idColumn, data);
      return new ResponseBase(200, 'Update success', updateResult);
    } catch (error) {
      return new ErrorBase(error);
    }
  }
}
