import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { Logger } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { QueryParamDataDto, RequestParamDataDto } from '../controller/query-filter.dto';
import { ConditionObject, RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { WorkspaceConnectionShouldNotBeEmpty } from '../../shared/errors/workspace-connection-empty.error';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME, EAppTableColumns } from '../../../domain/pgsql/app.core.domain.pg-script';
import { CanNotGetAppInforError } from '../errors/can-not-get-app-info.error';
import { AppConfigNotFoundError } from '../errors/app-config-not-found.error';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';

export class CanNotExecuteQueryError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string, message: string) {
    super(`Can not select data from ${schema} in ${appId} because ${message}`);
    this.name = CanNotExecuteQueryError.name;
    this.statusCode = 600;
  }
}

export class GetDataQuery {
  constructor(
    public readonly workspaceConnection: DataSourceOptions,
    public readonly requestParamDataDto: RequestParamDataDto,
    public readonly queryParamDataDto: QueryParamDataDto,
    public readonly conditions: ConditionObject,
    public readonly tableInfo: object[],
  ) { }
}
@QueryHandler(GetDataQuery)
export class GetDataQueryHandler
  implements IQueryHandler<GetDataQuery>
{

  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly getDataQueryBuilder!: RelationalDBQueryBuilder;
  private readonly queryBuilderTableApp!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(GetDataQueryHandler.name);

  constructor() {
    this.dbQueryDomain = new DbQueryDomain();
    this.queryBuilderTableApp = new RelationalDBQueryBuilder(
      APPLICATIONS_TABLE_NAME, APPLICATIONS_TABLE_AVAILABLE_COLUMS,
    );
    this.getDataQueryBuilder = new RelationalDBQueryBuilder();
  }

  async execute(query: GetDataQuery): Promise<object> {
    const { workspaceConnection, requestParamDataDto, queryParamDataDto, conditions, tableInfo } = query;

    if (!workspaceConnection) {
      return Promise.reject(new WorkspaceConnectionShouldNotBeEmpty());
    }

    const { appid, schema } = requestParamDataDto;
    const { orderby, page, selects, size, sort } = queryParamDataDto;

    const validColumns = this.dbQueryDomain.getTableColumnNameArray(tableInfo, 'column_name');
    const tableName = this.dbQueryDomain.getTableName(appid, schema);

    this.getDataQueryBuilder.setColumns(validColumns);
    this.getDataQueryBuilder.setTableName(tableName);

    // Prepare insert query builder
    const getDataScript = this.getDataQueryBuilder.getByQuery(
      {
        conditions: conditions,
        orderby: orderby,
        page: page,
        size: size,
        sort: sort,
      },
      selects
    );

    // Prepare query application info - db config
    let workspaceTypeOrmDataSource: DataSource;
    const queryAppScript = this.queryBuilderTableApp.getByQuery({
      conditions: { [EAppTableColumns.ID]: requestParamDataDto.appid, }
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
      return Promise.reject(new CanNotGetAppInforError(appid, error.message));
    }

    if (!applicationInfo) {
      return Promise.reject(new AppConfigNotFoundError(appid));
    }

    // Execute insert many using defaut connections;
    const { use_default_db, database_config } = applicationInfo;
    try {
      if (use_default_db) {
        const queryResult = await workspaceTypeOrmDataSource.query(getDataScript.queryString, getDataScript.params);
        return Promise.resolve(queryResult);
      }
    } catch (error) {
      return Promise.reject(new CanNotExecuteQueryError(appid, tableName, error.message));
    } finally {
      workspaceTypeOrmDataSource?.destroy();
    }

    // Insert many with application connection to database
    let appTypeOrmDataSource: DataSource;
    try {
      appTypeOrmDataSource = await new DataSource(database_config).initialize();
      const queryResult = await appTypeOrmDataSource.query(getDataScript.queryString, getDataScript.params);
      return Promise.resolve(queryResult);
    } catch (error) {
      return Promise.reject(new CanNotExecuteQueryError(appid, tableName, error.message));
    } finally {
      appTypeOrmDataSource?.destroy();
    }
  }
}
