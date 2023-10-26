import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { QueryBuilderResult, RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME, EAppTableColumns } from '../../../domain/pgsql/app.core.domain.pg-script';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import { WorkspaceConnectionShouldNotBeEmpty } from '../../shared/errors/workspace-connection-empty.error';
import { CanNotGetAppInforError } from '../errors/can-not-get-app-info.error';
import { AppConfigNotFoundError } from '../errors/app-config-not-found.error';
import { InvalidColumnOfTableError } from '../errors/invalid-table-colums.error';
import { checkObjectsForSameKey } from '../../../lib/utils/check-array-object-match-key';
import NodeCache from 'node-cache';
import { AppCoreDomain } from '../../../domain/app.core.domain';
import { ApplicationModel } from '../../../domain/models/code-application.model';
import { NotFoundApplicationById } from '../../generator/commands/execute-script.command';

export class DataToInserNotHaveSameKeyError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string) {
    super(`Can not insert new record into ${schema} in ${appId} because data insert not have same key each object`);
    this.name = EmptyRecordWhenInsertError.name;
    this.statusCode = 611;
  }
}

export class EmptyRecordWhenInsertError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string) {
    super(`Can not insert new record into ${schema} in ${appId} because data to insert empty`);
    this.name = EmptyRecordWhenInsertError.name;
    this.statusCode = 612;
  }
}

export class CanNotInsertNewRecordError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string, message: string) {
    super(`Can not insert new record into ${schema} in ${appId} because ${message}`);
    this.name = CanNotInsertNewRecordError.name;
    this.statusCode = 614;
  }
}

export class CreateDataCommand {
  constructor(
    public readonly appInfo: ApplicationModel,
    public readonly tableInfo: object[],

    public readonly appId: string,
    public readonly schema: string,
    public readonly data: Array<Partial<{ [key: string]: object }>>,
  ) { }
}
@CommandHandler(CreateDataCommand)
export class CreateDataCommandHandler
  implements ICommandHandler<CreateDataCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly queryBuilderTableInsert!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(CreateDataCommandHandler.name);

  constructor(
    private readonly nodeCache: NodeCache,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.queryBuilderTableInsert = new RelationalDBQueryBuilder();
  }
  // LOGIC: Lấy thông tin ứng dụng dừa vào workspace connection
  // NẾu ứng dụng use default connection thì dùng connection đó để truy vấn đến bảng
  // Sau đso thực thi kết quả của người dùng.
  async execute(command: CreateDataCommand) {
    const { appInfo, appId, schema, data, tableInfo } = command;

    if (!appInfo) {
      return Promise.reject(new NotFoundApplicationById(appId, 'CreateDataCommandHandler not found application info'));
    }

    const tableName = this.dbQueryDomain.getTableName(appId, schema);

    if (!data || data.length == 0) {
      return Promise.reject(new EmptyRecordWhenInsertError(appId, tableName));
    }

    if (!checkObjectsForSameKey(data)) {
      return Promise.reject(new DataToInserNotHaveSameKeyError(appId, tableName))
    }

    const validColumns = this.dbQueryDomain.getTableColumnNameArray(tableInfo, 'column_name');
    this.queryBuilderTableInsert.setTableName(tableName);
    this.queryBuilderTableInsert.setColumns(validColumns);

    // Prepare insert query builder
    let insertQuery: QueryBuilderResult;
    try {
      insertQuery = this.queryBuilderTableInsert.insertMany(data, Object.keys(data[0]));
    } catch (error) {
      return Promise.reject(new InvalidColumnOfTableError(appId, schema, error.message));
    }

    // Execute insert many using defaut connections;
    let workspaceDataSource: DataSource;
    try {
      workspaceDataSource = await new DataSource(appInfo.database_config).initialize();
      const queryResult = await workspaceDataSource.query(insertQuery.queryString, insertQuery.params);
      await workspaceDataSource?.destroy();

      return Promise.resolve(queryResult);
    } catch (error) {
      await workspaceDataSource?.destroy();
      return Promise.reject(new CanNotInsertNewRecordError(appId, schema, error.message));
    }
  }

}
