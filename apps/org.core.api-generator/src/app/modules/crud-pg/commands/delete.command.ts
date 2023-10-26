import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { GetDataQueryHandler } from '../queries/get-by-conditions.query';
import { Logger } from '@nestjs/common';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import { InvalidColumnOfTableError } from '../errors/invalid-table-colums.error';

export class CanNotDeleteResultError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string, recordId: string | number, err: string) {
    super(`Can not delete record ${recordId} from ${schema} in ${appId} because ${err}`);
    this.name = CanNotDeleteResultError.name;
    this.statusCode = 612;
  }
}


export class DeleteDataCommand {
  constructor(
    public readonly workspaceConnection: DataSourceOptions,
    public readonly appid: string,
    public readonly schema: string,
    public readonly id: number,
    public readonly column: string, // <--- id column
    public readonly tableInfo: object[],
  ) { }
}
@CommandHandler(DeleteDataCommand)
export class DeleteDataCommandHandler
  implements ICommandHandler<DeleteDataCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly relationalDBQueryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(GetDataQueryHandler.name);

  constructor(
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }

  async execute(command: DeleteDataCommand) {
    const { appid, id, schema, tableInfo, column, workspaceConnection } = command;
    const tableName = this.dbQueryDomain.getTableName(appid, schema);

    const validColumns = this.dbQueryDomain.getTableColumnNameArray(tableInfo, 'column_name');

    this.relationalDBQueryBuilder.setTableName(tableName);
    this.relationalDBQueryBuilder.setColumns(validColumns);

    let query: string;
    let queryParam: unknown[];

    try {
      const { queryString, params } = this.relationalDBQueryBuilder.deleteBy(column, id);
      query = queryString;
      queryParam = params;
    } catch (error) {
      return Promise.reject(new InvalidColumnOfTableError(appid, schema, error.message));
    }

    try {
      const workspaceTypeOrmDataSource = await new DataSource(workspaceConnection).initialize();
      const deleteResult = await workspaceTypeOrmDataSource.query(query, queryParam);

      return Promise.resolve(deleteResult[1]);
    } catch (error) {
      this.logger.error(error);
      return Promise.reject(new CanNotDeleteResultError(appid, schema, id, error.message));
    }
  }
}
