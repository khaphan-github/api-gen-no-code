import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { QueryParamDataDto, RequestParamDataDto } from '../controller/query-filter.dto';
import { ConditionObject, QueryBuilderResult, RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME } from '../../../domain/pgsql/app.core.domain.pg-script';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import { InvalidColumnOfTableError } from '../errors/invalid-table-colums.error';
import { ApplicationModel } from '../../../domain/models/code-application.model';

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
    public readonly appInfo: ApplicationModel,
    public readonly tableInfo: object[],
    public readonly requestParamDataDto: RequestParamDataDto,
    public readonly queryParamDataDto: QueryParamDataDto,
    public readonly conditions: ConditionObject,
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
    const { appInfo, requestParamDataDto, queryParamDataDto, conditions, tableInfo } = query;

    const { appid, schema } = requestParamDataDto;
    const { orderby, page, selects, size, sort } = queryParamDataDto;

    const validColumns = this.dbQueryDomain.getTableColumnNameArray(tableInfo, 'column_name');
    const tableName = this.dbQueryDomain.getTableName(appid, schema);

    this.getDataQueryBuilder.setColumns(validColumns);
    this.getDataQueryBuilder.setTableName(tableName);

    // Prepare insert query builder
    let getDataScript: QueryBuilderResult;
    try {
      getDataScript = this.getDataQueryBuilder.getByQuery(
        {
          conditions: conditions,
          orderby: orderby,
          page: page,
          size: size,
          sort: sort,
        },
        selects
      );
    } catch (error) {
      return Promise.reject(new InvalidColumnOfTableError(appid, schema, error.message));
    }

    // Prepare query application info - db config

    // Insert many with application connection to database
    let appTypeOrmDataSource: DataSource;
    try {
      appTypeOrmDataSource = await new DataSource(appInfo.database_config).initialize();
      const queryResult = await appTypeOrmDataSource.query(getDataScript.queryString, getDataScript.params);
      await appTypeOrmDataSource?.destroy();
      return Promise.resolve(queryResult);
    } catch (error) {
      await appTypeOrmDataSource?.destroy();
      return Promise.reject(new CanNotExecuteQueryError(appid, tableName, error.message));
    }
  }
}
