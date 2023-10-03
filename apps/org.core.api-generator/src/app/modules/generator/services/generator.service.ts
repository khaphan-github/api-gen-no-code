import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetAppConfigQuery } from "../queries/get_app_config.query";
import { CreateWorkspaceDto } from "../dto/create-workspace.dto";
import { CreateWorkspaceCommand } from "../commands/create-workspace.command";
import { DropSchemaCommand } from "../commands/drop-schema.command";
import { ExecuteScriptDto } from "../dto/script.dto";
import { ExecuteScriptCommand } from "../commands/execute-script.command";
import { QueryParamDataDto } from "../../crud-pg/controller/query-filter.dto";
import { GetWorkspaceByIdQuery } from "../queries/get-workspace.query";
import { CreateApplicationDto } from "../dto/create-app.dto";
import { CreateApplicationCommand } from "../commands/create-app.command";
import { GetAppsByWorkspaceIdQuery } from "../queries/get-app-by-workspace-id.query";
import { GetWorkspaceConnectionQuery } from "../queries/get-workspace-connection.query";

@Injectable()
export class GeneratorService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  getApps() {
    return this.queryBus.execute(new GetAppConfigQuery());
  }

  createWorkspace(createAppDto: CreateWorkspaceDto) {
    return this.commandBus.execute(new CreateWorkspaceCommand(createAppDto));
  }

  dropSchema(appId: string, schema: string,) {
    return this.commandBus.execute(new DropSchemaCommand(appId, schema));
  }

  executeCreateDatabaseScript = (appId: string | number, scripts: ExecuteScriptDto) => {
    return this.commandBus.execute(new ExecuteScriptCommand(appId, scripts));
  }

  async isExistedWorkspace() {
    try {
      await this.getWorkspaceConnection();
    } catch (error) {
      return false;
    }
    return true;
  }

  async getWorkspaceById(id: string, queryParamDto: QueryParamDataDto) {
    const workspaceConnection = await this.getWorkspaceConnection();
    return this.queryBus.execute(new GetWorkspaceByIdQuery(workspaceConnection, id, queryParamDto));
  }

  createApp(ownerId: string, createAppDto: CreateApplicationDto) {
    return this.commandBus.execute(new CreateApplicationCommand(ownerId, createAppDto));
  }

  async getAppsByWorkspaceId(ownerId: string, workspaceId: number,) {
    const workspaceConnection = await this.getWorkspaceConnection();
    return this.queryBus.execute(new GetAppsByWorkspaceIdQuery(workspaceConnection, ownerId, workspaceId));
  }

  private getWorkspaceConnection() {
    return this.queryBus.execute(new GetWorkspaceConnectionQuery(2023));
  }
} 