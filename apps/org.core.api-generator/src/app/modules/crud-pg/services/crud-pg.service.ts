import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { QueryParamDataDto, RequestParamDataDto } from "../controller/query-filter.dto";
import { ConditionObject } from "../../../domain/relationaldb.query-builder";
import { GetDataQuery } from "../queries/get-one.query";
import { DeleteDataCommand } from "../commands/delete.command";
import { CreateDataCommand } from "../commands/create..command";
import { UpdateDataCommand } from "../commands/update.command";
import { GetSchemaStructureQuery } from "../queries/get-schema-structure.query";

@Injectable()
export class CrudService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  async insert(appId: string, schema: string, data: object) {
    const tableInfo = await this.getTableInfo(appId, schema);
    return this.commandBus.execute(new CreateDataCommand(appId, schema, data, tableInfo));
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
    const { appid, schema } = requestParamDataDto;
    const tableInfo = await this.getTableInfo(appid, schema);
    return this.queryBus.execute(
      new GetDataQuery(requestParamDataDto, queryParamDataDto, conditions, tableInfo)
    );
  }

  getSchemaStructure(appId: string, schema: string) {
    return this.queryBus.execute(new GetSchemaStructureQuery(appId, schema));
  }

  private getTableInfo = (appId: string, schema: string,) => {
    return this.queryBus.execute(new GetSchemaStructureQuery(appId, schema));
  }
}