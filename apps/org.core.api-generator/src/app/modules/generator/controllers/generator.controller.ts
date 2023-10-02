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

  @Get('apps')
  @HttpCode(200)
  @ApiOperation({
    description: `Lấy danh sach apps`
  })
  async getConfig() {
    return new ResponseBase(200, 'Create app success', await this.service.getApps());
  }

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
  executeCreateDbScript(
    @Param('appid') appId: string,
    @Body() scripts: ExecuteScriptDto
  ) {
    return this.service.executeCreateDatabaseScript(appId, scripts);
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

  @Get('workspace')
  @HttpCode(200)
  async isExistedWorkspace() {
    const isExistedWorkspace = await this.service.isExistedWorkspace();
    if (isExistedWorkspace !== true) {
      if (isExistedWorkspace.errno === -111)
        return new ResponseBase(-111, 'Không thể kế nối đến databsse', isExistedWorkspace);
    }
    return new ResponseBase(200, 'Check is exited workspace success', isExistedWorkspace);
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
