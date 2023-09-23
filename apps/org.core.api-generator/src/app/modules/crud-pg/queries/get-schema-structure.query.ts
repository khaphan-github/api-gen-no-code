import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { Logger } from '@nestjs/common';
import NodeCache from 'node-cache';

export class GetSchemaStructureQuery {
  constructor(
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

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly nodeCache: NodeCache,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }

  async execute(query: GetSchemaStructureQuery): Promise<unknown> {
    const { appid, schema } = query;

    const tableName = this.dbQueryDomain.getTableName(appid, schema).replace('public.', '');

    // Cahing
    const cacheKey = this.dbQueryDomain.getCachingTableInfo(tableName);
    const tableInfoFromCache = this.nodeCache.get(cacheKey);
    if (tableInfoFromCache) {
      return tableInfoFromCache;
    }

    this.relationalDBQueryBuilder.setColumns(['column_name', 'table_name']);
    this.relationalDBQueryBuilder.setTableName('information_schema.columns');

    try {
      const { queryString, params } = this.relationalDBQueryBuilder.getByQuery(
        { conditions: { 'table_name': tableName } }, ['column_name']
      );
      const queryResult = await this.entityManager.query(queryString, params);
      this.nodeCache.set(cacheKey, queryResult);

      return queryResult;
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: `Error when get table information! table: ${error}`
      }
    }
  }
}
