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
      return new ResponseBase(400, 'Query failure because:', {
        errorMessage: error.message
      });
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteById(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Param('id') id: number
  ) {
    try {
      const deleteResult = await this.service.delete(appId, schema, id);
      return new ResponseBase(204, 'Delete success', deleteResult);
    } catch (error) {
      return new ResponseBase(400, 'Delete failure:', {
        errorMessage: error.message
      });
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
      return new ResponseBase(400, 'Insert failure:', {
        errorMessage: error.message
      });
    }
  }

  @Put(':id')
  @HttpCode(200)
  async update(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
    @Param('id') id: string,
    @Body() data: object
  ) {
    try {
      const updateResult = await this.service.update(appId, schema, id, data);
      return new ResponseBase(200, 'Update success', updateResult);
    } catch (error) {
      return new ResponseBase(400, 'Update failure:', {
        errorMessage: error.message
      });
    }
  }

  @Get('structure')
  async getSchemaInfo(
    @Param('appid') appId: string,
    @Param('schema') schema: string
  ) {
    try {
      const schemaStructure = await this.service.getSchemaStructure(appId, schema);
      return new ResponseBase(200, 'This is schema structure', schemaStructure);
    } catch (error) {
      return new ResponseBase(400, 'Get schema structure failure:', {
        errorMessage: error.message
      });
    }
  }
}
