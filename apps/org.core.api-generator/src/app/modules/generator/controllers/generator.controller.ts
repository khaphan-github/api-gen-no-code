import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExecuteScriptDto } from '../dto/script.dto';
import { CreateAppDto } from '../dto/create-app.dto';
import { GeneratorService } from '../services/generator.service';

@ApiTags('Api Generator')
@Controller('generator')
export class GeneratorController {
  constructor(
    private readonly service: GeneratorService,
  ) { }

  @Get('apps')
  @ApiOperation({
    description: `Lấy danh sach apps`
  })
  async getConfig() {
    return {
      statusCode: 200,
      message: 'Create app success',
      data: await this.service.getApps()
    }
  }


  @Delete('app/:appid/schema/:schema')
  dropTable(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
  ) {
    return this.service.dropSchema(appId, schema);
  }

  @Put('app/:appid/config')
  async updateConfig(
    @Param('appid') appId: string,
    @Body() dbConfig: any,
  ) {
    throw new Error('update app config');
  }


  @Post('app/:appid/script')
  executeCreateDbScript(
    @Param('appid') appId: string,
    @Body() scripts: ExecuteScriptDto
  ) {
    return this.service.executeCreateDatabaseScript(appId, scripts);
  }

  @Post('app')
  async createApp(@Body() createAppDto: CreateAppDto) {
    const appCreated = await this.service.createApp(createAppDto);
    if (appCreated !== true) {
      if (appCreated.errno === -111)
      return {
        statusCode: -111,
        message: 'Không thể kế nối đến databsse',
        data: appCreated
      }
    }

    return {
      statusCode: 200,
      message: 'Create app success',
      data: appCreated
    }
  }
  // TODO: API get list of API generated.

}
