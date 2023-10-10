import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { QueryBuilderResult, RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME, EAppTableColumns } from '../../../domain/app.core.domain.script';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import { WorkspaceConnectionShouldNotBeEmpty } from '../../shared/errors/workspace-connection-empty.error';
import { CanNotGetAppInforError } from '../errors/can-not-get-app-info.error';
import { AppConfigNotFoundError } from '../errors/app-config-not-found.error';

export class DataToInserNotHaveSameKeyError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string) {
    super(`Can not insert new record into ${schema} in ${appId} because data insert not have same key`);
    this.name = EmptyRecordWhenInsertError.name;
    this.statusCode = 600;
  }
}

export class EmptyRecordWhenInsertError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string) {
    super(`Can not insert new record into ${schema} in ${appId} because data to insert empty`);
    this.name = EmptyRecordWhenInsertError.name;
    this.statusCode = 601;
  }
}

export class RequestBodyNotMatchTableError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string, errorMessage: string) {
    super(`Can not insert to ${schema} schema in app id ${appId} because ${errorMessage}`);
    this.name = RequestBodyNotMatchTableError.name;
    this.statusCode = 602;
  }
}

export class CanNotInsertNewRecordError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string, message: string) {
    super(`Can not insert new record into ${schema} in ${appId} because ${message}`);
    this.name = CanNotInsertNewRecordError.name;
    this.statusCode = 604;
  }
}

export class CreateDataCommand {
  constructor(
    public readonly workspaceConnection: DataSourceOptions,
    public readonly appId: string,
    public readonly schema: string,
    public readonly data: Array<Partial<{ [key: string]: object }>>,
    public readonly tableInfo: object[],
  ) { }
}
@CommandHandler(CreateDataCommand)
export class CreateDataCommandHandler
  implements ICommandHandler<CreateDataCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly queryBuilderTableApp!: RelationalDBQueryBuilder;
  private readonly queryBuilderTableInsert!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(CreateDataCommandHandler.name);

  constructor() {
    this.dbQueryDomain = new DbQueryDomain();
    this.queryBuilderTableApp = new RelationalDBQueryBuilder(
      APPLICATIONS_TABLE_NAME, APPLICATIONS_TABLE_AVAILABLE_COLUMS,
    );
    this.queryBuilderTableInsert = new RelationalDBQueryBuilder();
  }
  // LOGIC: Lấy thông tin ứng dụng dừa vào workspace connection
  // NẾu ứng dụng use default connection thì dùng connection đó để truy vấn đến bảng
  // Sau đso thực thi kết quả của người dùng.
  async execute(command: CreateDataCommand) {
    const { workspaceConnection, appId, schema, data, tableInfo } = command;

    // Validate input
    if (!workspaceConnection) {
      return Promise.reject(new WorkspaceConnectionShouldNotBeEmpty());
    }
    const tableName = this.dbQueryDomain.getTableName(appId, schema);

    if (!data || data.length == 0) {
      return Promise.reject(new EmptyRecordWhenInsertError(appId, tableName));
    }

    if (!this.checkObjectsForSameKey(data)) {
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
      return Promise.reject(new RequestBodyNotMatchTableError(appId, tableName, error.message));
    }

    // Prepare query application info - db config
    let workspaceTypeOrmDataSource: DataSource;
    const queryAppScript = this.queryBuilderTableApp.getByQuery({
      conditions: { [EAppTableColumns.ID]: appId, }
    }, [
      EAppTableColumns.ID,
      EAppTableColumns.DATABASE_CONFIG,
      EAppTableColumns.USE_DEFAULT_DB,
    ]);

    let applicationInfo: { use_default_db: boolean; database_config: DataSourceOptions; };
    try {
      workspaceTypeOrmDataSource = await new DataSource(workspaceConnection).initialize();
      const appDBConfig = await workspaceTypeOrmDataSource.query(
        queryAppScript.queryString, queryAppScript.params
      );
      applicationInfo = appDBConfig[0];
    } catch (error) {
      return Promise.reject(new CanNotGetAppInforError(appId, error.message));
    }

    if (!applicationInfo) {
      return Promise.reject(new AppConfigNotFoundError(appId));
    }

    // Execute insert many using defaut connections;
    const { use_default_db, database_config } = applicationInfo;
    try {
      if (use_default_db) {
        const queryResult = await workspaceTypeOrmDataSource.query(insertQuery.queryString, insertQuery.params);
        return Promise.resolve(queryResult);
      }
    } catch (error) {
      return Promise.reject(new CanNotInsertNewRecordError(appId, tableName, error.message));
    } finally {
      workspaceTypeOrmDataSource?.destroy();
    }

    // Insert many with application connection to database
    let appTypeOrmDataSource: DataSource;
    try {
      appTypeOrmDataSource = await new DataSource(database_config).initialize();
      const queryResult = await appTypeOrmDataSource.query(insertQuery.queryString, insertQuery.params);
      return Promise.resolve(queryResult);
    } catch (error) {
      return Promise.reject(new CanNotInsertNewRecordError(appId, tableName, error.message));
    } finally {
      appTypeOrmDataSource?.destroy();
    }
  }

  private checkObjectsForSameKey(arr: object[]): boolean {
    if (arr.length === 0) {
      throw new Error("Array is empty.");
    }
    const firstObjectKeys = Object.keys(arr[0]);

    for (let i = 1; i < arr.length; i++) {
      const currentObjectKeys = Object.keys(arr[i]);

      if (
        currentObjectKeys.length !== firstObjectKeys.length ||
        !currentObjectKeys.every((key) => firstObjectKeys.includes(key))
      ) {
        return false;
      }
    }
    return true;
  }
}
