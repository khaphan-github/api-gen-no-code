import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { QueryParamDataDto, RequestParamDataDto } from "../controller/query-filter.dto";
import { ConditionObject } from "../../../domain/relationaldb.query-builder";
import { GetDataQuery } from "../queries/get-by-conditions.query";
import { DeleteDataCommand } from "../commands/delete.command";
import { CreateDataCommand } from "../commands/create..command";
import { UpdateDataCommand } from "../commands/update.command";
import { GetSchemaStructureQuery } from "../queries/get-schema-structure.query";
import { GetWorkspaceConnectionQuery } from "../../generator/queries/get-workspace-connection.query";

@Injectable()
export class CrudService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  async insert(appId: string, schema: string, data: Array<object>) {
    const [tableInfo, workspaceConnection] = await Promise.all([
      this.getTableInfo(appId, schema),
      this.getWorkspaceConnection(),
    ]);
    return this.commandBus.execute(
      new CreateDataCommand(workspaceConnection, appId, schema, data, tableInfo)
    );
  }

  async update(appId: string, schema: string, id: string, data: object) {
    const tableInfo = await this.getTableInfo(appId, schema);
    return this.commandBus.execute(new UpdateDataCommand(appId, schema, id, data, tableInfo));
  }

  async delete(appId: string, schema: string, id: number) {
    const tableInfo = await this.getTableInfo(appId, schema);
    return this.commandBus.execute(new DeleteDataCommand(appId, schema, id, tableInfo));
  }

  async query(
    requestParamDataDto: RequestParamDataDto,
    queryParamDataDto: QueryParamDataDto,
    conditions: ConditionObject,
  ) {
    // TODO: Handle validator ownerId;
    const { appid, schema } = requestParamDataDto;
    const [tableInfo, workspaceConnection] = await Promise.all([
      this.getTableInfo(appid, schema),
      this.getWorkspaceConnection(),
    ]);
    return this.queryBus.execute(
      new GetDataQuery(workspaceConnection, requestParamDataDto, queryParamDataDto, conditions, tableInfo)
    );
  }

  async getSchemaStructure(appId: string, schema: string) {
    const workspaceConnection = await this.getWorkspaceConnection();
    return this.queryBus.execute(new GetSchemaStructureQuery(workspaceConnection, appId, schema));
  }

  private getTableInfo = async (appId: string, schema: string,) => {
    const workspaceConnection = await this.getWorkspaceConnection();
    return this.queryBus.execute(new GetSchemaStructureQuery(workspaceConnection, appId, schema));
  }

  private getWorkspaceConnection() {
    return this.queryBus.execute(new GetWorkspaceConnectionQuery());
  }
}