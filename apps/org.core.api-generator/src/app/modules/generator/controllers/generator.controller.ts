import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExecuteScriptDto } from '../dto/script.dto';
import { GeneratorService } from '../services/generator.service';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { ResponseBase } from '../../../infrastructure/format/response.base';
import { QueryParamDataDto } from '../../crud-pg/controller/query-filter.dto';
import { CreateApplicationDto } from '../dto/create-app.dto';

@ApiTags('Api Generator')
@Controller('generator')
export class GeneratorController {
  constructor(
    private readonly service: GeneratorService,
  ) { }

  @Delete('app/:appid/schema/:schema')
  @HttpCode(204)
  async dropTable(
    @Param('appid') appId: string,
    @Param('schema') schema: string,
  ) {
    return new ResponseBase(200, 'Delete schema successs', await this.service.dropSchema(appId, schema));
  }

  @Post('app/:appid/script')
  @HttpCode(201)
  async executeCreateDbScript(
    @Param('appid') appId: string,
    @Body() scripts: ExecuteScriptDto
  ) {
    const executeResult = await this.service.executeCreateDatabaseScript(appId, scripts);
    return new ResponseBase(201, 'Execute create databsse by script success', executeResult);
  }

  @Post('app')
  async createApp(@Body() createAppDto: CreateApplicationDto) {
    const ownerID = 'test_owner_id';
    const appCreated = await this.service.createApp(ownerID, createAppDto);
    if (appCreated !== true) {
      if (appCreated.errno === -111)
        return new ResponseBase(-111, 'Không thể kế nối đến databsse', appCreated);
    }
    return new ResponseBase(200, 'Create app success', appCreated);
  }

  @Get('app/:appid/script')
  async getScriptByAppId(
    @Param('appid') appId: number,
  ) {
    const ownerID = 'test_owner_id';
    try {
      const script = await this.service.getCreateDbScriptByAppId(appId, ownerID);
      if (script?.length === 0) {
        return new ResponseBase(404, `Not found script by app id ${appId}`);
      }
      return new ResponseBase(200, 'Get create data base script success', script);
    } catch (error) {
      return new ResponseBase(601, error.message);
    }
  }

  @Get('workspace')
  @HttpCode(200)
  async isExistedWorkspace() {
    const isExistedWorkspace = await this.service.isExistedWorkspace();
    return new ResponseBase(200, 'Check is exited workspace success', {
      isExisted: isExistedWorkspace,
      woskspaceId: 2023
    });
  }

  @Post('workspace')
  @HttpCode(201)
  async createWorkspace(@Body() createAppDto: CreateWorkspaceDto) {
    const appCreated = await this.service.createWorkspace(createAppDto);
    if (appCreated !== true) {
      if (appCreated.errno === -111)
        return new ResponseBase(-111, 'Không thể kế nối đến databsse', appCreated);
    }
    return new ResponseBase(200, 'Create app success', appCreated);
  }

  @Get('workspace/:id')
  @HttpCode(200)
  async getWorkspaceById(
    @Param('id') id: string,
    @Query() queryParamDataDto: QueryParamDataDto,
  ) {
    const workspace = await this.service.getWorkspaceById(id, queryParamDataDto);
    return new ResponseBase(200, 'Get workspace info success', workspace);
  }
  @Get('workspace/:id/app')
  @HttpCode(200)
  async getAppsByWorkspaceId(@Param('id') id: number) {
    const ownerID = 'test_owner_id';
    const apps = await this.service.getAppsByWorkspaceId(ownerID, id)
    return new ResponseBase(200, 'Get app by workspace id success', apps);
  }
}
