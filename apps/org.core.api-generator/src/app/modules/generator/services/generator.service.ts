import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetAppConfigQuery } from "../queries/get_app_config.query";
import { CreateWorkspaceDto } from "../dto/create-workspace.dto";
import { CreateWorkspaceCommand } from "../commands/create-workspace.command";
import { DropSchemaCommand } from "../commands/drop-schema.command";
import { ExecuteScriptDto } from "../dto/script.dto";
import { ExecuteScriptCommand } from "../commands/execute-script.command";
import { IsExistedWorkspaceQuery } from "../queries/is-exited-workspace.query";
import { QueryParamDataDto } from "../../crud-pg/controller/query-filter.dto";
import { GetWorkspaceByIdQuery } from "../queries/get-workspace.query";
import { CreateApplicationDto } from "../dto/create-app.dto";
import { CreateApplicationCommand } from "../commands/create-app.command";
import { GetAppsByWorkspaceIdQuery } from "../queries/get-app-by-workspace-id.query";

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

  isExistedWorkspace() {
    return this.queryBus.execute(new IsExistedWorkspaceQuery());
  }

  getWorkspaceById(id: string, queryParamDto: QueryParamDataDto) {
    return this.queryBus.execute(new GetWorkspaceByIdQuery(id, queryParamDto));
  }

  createApp(ownerId: string, createAppDto: CreateApplicationDto) {
    return this.commandBus.execute(new CreateApplicationCommand(ownerId, createAppDto));
  }

  getAppsByWorkspaceId(ownerId: string, workspaceId: number,) {
    return this.queryBus.execute(new GetAppsByWorkspaceIdQuery(ownerId, workspaceId));
  }
} 