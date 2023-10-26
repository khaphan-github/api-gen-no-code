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
  private readonly appCoreDomain!: AppCoreDomain;

  private readonly logger = new Logger(CreateDataCommandHandler.name);

  constructor(
    private readonly nodeCache: NodeCache,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.queryBuilderTableApp = new RelationalDBQueryBuilder(
      APPLICATIONS_TABLE_NAME, APPLICATIONS_TABLE_AVAILABLE_COLUMS,
    );
    this.queryBuilderTableInsert = new RelationalDBQueryBuilder();
    this.appCoreDomain = new AppCoreDomain();
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

    // Prepare query application info - db config
    const appInfoCacheKey = this.appCoreDomain.getAppInfoCacheKey(appId);
    let applicationInfo: { use_default_db: boolean; database_config: DataSourceOptions; };
    const appInfoInCache = this.nodeCache.get(appInfoCacheKey) as { use_default_db: boolean; database_config: DataSourceOptions; };

    if (appInfoInCache) {
      applicationInfo = appInfoInCache;
    }

    let workspaceTypeOrmDataSource: DataSource;
    if (!applicationInfo) {
      const queryAppScript = this.queryBuilderTableApp.getByQuery({
        conditions: { [EAppTableColumns.ID]: appId, }
      }, [
        EAppTableColumns.ID,
        EAppTableColumns.DATABASE_CONFIG,
        EAppTableColumns.USE_DEFAULT_DB,
      ]);

      try {
        workspaceTypeOrmDataSource = await new DataSource(workspaceConnection).initialize();
        const appDBConfig = await workspaceTypeOrmDataSource.query(
          queryAppScript.queryString, queryAppScript.params
        );
        this.nodeCache.set(appInfoCacheKey, appDBConfig[0]);
        applicationInfo = appDBConfig[0];
      } catch (error) {
        return Promise.reject(new CanNotGetAppInforError(appId, error.message));
      } finally {
        workspaceTypeOrmDataSource?.destroy();
      }
    }

    if (!applicationInfo) {
      return Promise.reject(new AppConfigNotFoundError(appId));
    }

    // Execute insert many using defaut connections;
    const { use_default_db, database_config } = applicationInfo;
    let workspaceDataSource: DataSource;
    try {
      if (use_default_db) {
        workspaceDataSource = await new DataSource(database_config).initialize();
        const queryResult = await workspaceDataSource.query(insertQuery.queryString, insertQuery.params);
        return Promise.resolve(queryResult);
      }
    } catch (error) {
      return Promise.reject(new CanNotInsertNewRecordError(appId, schema, error.message));
    } finally {
      workspaceDataSource?.destroy();
    }

    // Insert many with application connection to database
    let appTypeOrmDataSource: DataSource;
    try {
      appTypeOrmDataSource = await new DataSource(database_config).initialize();
      const queryResult = await appTypeOrmDataSource.query(insertQuery.queryString, insertQuery.params);
      return Promise.resolve(queryResult);
    } catch (error) {
      return Promise.reject(new CanNotInsertNewRecordError(appId, schema, error.message));
    } finally {
      appTypeOrmDataSource?.destroy();
    }
  }

}
