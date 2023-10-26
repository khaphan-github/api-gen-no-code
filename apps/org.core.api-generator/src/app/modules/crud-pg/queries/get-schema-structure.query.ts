import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { DataSource } from 'typeorm';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { Logger } from '@nestjs/common';
import NodeCache from 'node-cache';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import { DefaultResponseError } from '../errors/default.error';
import { ApplicationModel } from '../../../domain/models/code-application.model';

export class NotFoundAppByIdError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, schema: string) {
    super(`Application id ${appId} not found or schema ${schema} not found!`);
    this.name = NotFoundAppByIdError.name;
    this.statusCode = 600;
  }
}

export class GetSchemaStructureQuery {
  constructor(
    public readonly appInfo: ApplicationModel,
    public readonly appid: string,
    public readonly schema: string,
  ) { }
}

@QueryHandler(GetSchemaStructureQuery)
export class GetSchemaStructureQueryHandler
  implements IQueryHandler<GetSchemaStructureQuery>
{

  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly relationalDBQueryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(GetSchemaStructureQueryHandler.name);

  // TODO: Lấy thông tin database dùng config của APP sử dụng config của app để lấy thông tin bảng
  // TODO: Dùng config của application để truy vấn lấy thông tin của bảng
  constructor(
    private readonly nodeCache: NodeCache,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder(
      'information_schema.columns',
      ['column_name', 'table_name']
    );
  }

  async execute(query: GetSchemaStructureQuery): Promise<unknown> {
    const { appInfo, appid, schema } = query;

    const tableName = this.dbQueryDomain.getTableName(appid, schema).replace('public.', '');

    // Cahing
    const cacheKey = this.dbQueryDomain.getCachingTableInfo(appid, tableName);
    const tableInfoFromCache = this.nodeCache.get(cacheKey);

    if (tableInfoFromCache) {
      return tableInfoFromCache;
    }

    const { queryString, params } = this.relationalDBQueryBuilder.getByQuery(
      { conditions: { 'table_name': tableName } }, ['column_name']
    );

    let typeormDataSource: DataSource;

    try {
      typeormDataSource = await new DataSource(appInfo.database_config).initialize();
      const queryResult = await typeormDataSource.query(queryString, params);
      if (!queryResult || queryResult?.length == 0) {
        return Promise.reject(new NotFoundAppByIdError(appid, schema));
      }
      this.nodeCache.set(cacheKey, queryResult);
      await typeormDataSource?.destroy();
      return Promise.resolve(queryResult);
    } catch (error) {
      await typeormDataSource?.destroy();
      this.logger.error(error);
      return Promise.reject(new DefaultResponseError(error))
    }
  }
}