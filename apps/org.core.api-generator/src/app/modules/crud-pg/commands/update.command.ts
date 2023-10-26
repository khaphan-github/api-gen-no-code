import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { Logger } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { InvalidColumnOfTableError } from '../errors/invalid-table-colums.error';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';

export class CanNotUpdateResultError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string, recordId: string | number, err: string) {
    super(`Can not update record ${recordId} from ${schema} in ${appId} because ${err}`);
    this.name = CanNotUpdateResultError.name;
    this.statusCode = 613;
  }
}

export class UpdateDataCommand {
  constructor(
    public readonly workspaceConnection: DataSourceOptions,
    public readonly appId: string,
    public readonly schema: string,
    public readonly id: string | number,
    public readonly idColumn: string,
    public readonly data: Partial<{ [key: string]: object }>,
    public readonly tableInfo: object[],
  ) { }
}
@CommandHandler(UpdateDataCommand)
export class UpdateDataCommandHandler
  implements ICommandHandler<UpdateDataCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly relationalDBQueryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(UpdateDataCommandHandler.name);
  constructor() {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }
  async execute(command: UpdateDataCommand) {
    const { appId, data, id, idColumn, workspaceConnection, schema, tableInfo } = command;

    const validColumns = this.dbQueryDomain.getTableColumnNameArray(tableInfo, 'column_name');
    const tableName = this.dbQueryDomain.getTableName(appId, schema);

    this.relationalDBQueryBuilder.setTableName(tableName);
    this.relationalDBQueryBuilder.setColumns(validColumns);

    let query: string;
    let queryParam: unknown[];
    try {
      const { queryString, params } = this.relationalDBQueryBuilder.update(idColumn, id, data);
      query = queryString;
      queryParam = params;
    } catch (error) {
      return Promise.reject(new InvalidColumnOfTableError(appId, schema, error.message));
    }

    try {
      const workspaceTypeOrmDataSource = await new DataSource(workspaceConnection).initialize();
      const updateResult = await workspaceTypeOrmDataSource.query(query, queryParam);

      return Promise.resolve(updateResult[0]);
    } catch (error) {
      this.logger.error(error);
      return Promise.reject(new CanNotUpdateResultError(appId, schema, id, error.message));
    }
  }
}
