import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { QueryParamDataDto, RequestParamDataDto } from '../controller/query-filter.dto';
import { ConditionObject, RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { GetSchemaStructureQuery } from './get-schema-structure.query';

export class GetDataQuery {
  constructor(
    public readonly requestParamDataDto: RequestParamDataDto,
    public readonly queryParamDataDto: QueryParamDataDto,
    public readonly conditions: ConditionObject
  ) { }
}
@QueryHandler(GetDataQuery)
export class GetDataQueryHandler
  implements IQueryHandler<GetDataQuery>
{

  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly relationalDBQueryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(GetDataQueryHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly queryBus: QueryBus,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }

  async execute(query: GetDataQuery): Promise<object> {
    const { requestParamDataDto, queryParamDataDto, conditions } = query;

    const { appid, schema } = requestParamDataDto;
    const { orderby, page, selects, size, sort } = queryParamDataDto;

    const tableInfo = await this.queryBus.execute(new GetSchemaStructureQuery(appid, schema));
    const validColumns = this.dbQueryDomain.getTableColumnNameArray(tableInfo, 'column_name');

    const tableName = this.dbQueryDomain.getTableName(appid, schema);

    this.relationalDBQueryBuilder.setColumns(validColumns);
    this.relationalDBQueryBuilder.setTableName(tableName);
    
    try {
      const { params, queryString } = this.relationalDBQueryBuilder.getByQuery(
        {
          conditions: conditions,
          orderby: orderby,
          page: page,
          size: size,
          sort: sort,
        },
        selects
      );
      const queryResult = await this.entityManager.query(queryString, params);
      return queryResult;
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: `${error}`
      }
    }
  }
}
