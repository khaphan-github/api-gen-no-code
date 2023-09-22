import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ConditionObject, DbQueryDomain } from '../../../domain/db.query.domain';
import { Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { QueryParamDataDto, RequestParamDataDto } from '../controller/query-filter.dto';
import _ from 'lodash';

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

  private readonly logger = new Logger(GetDataQueryHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
  }

  async execute(query: GetDataQuery): Promise<object> {
    const { requestParamDataDto, queryParamDataDto, conditions } = query;

    const { appid, schema } = requestParamDataDto;
    const { orderby, page, selects, size, sort } = queryParamDataDto;

    const conditionParams: string[] = [];
    const conditionQuery = this.dbQueryDomain.generateConditionQuery(conditions, conditionParams);
    const whereQuery = !_.isEmpty(conditions) ? ` WHERE ${conditionQuery} ` : '';

    const selectAttributes = selects.join(', ');
    const tableName = this.dbQueryDomain.getTableName(appid, schema);

    const sortQuery = sort ? 'ASC' : 'DESC';
    const orderByQuery = orderby ? ` ORDER BY ${orderby} ${sortQuery}` : '';

    const sizeQuery = ` LIMIT ${size ? +size : 10} `;
    const pageQuery = ` OFFSET ${page ? +page : 0} `;

    const queryString = `
      SELECT ${selectAttributes}
      FROM ${tableName}
      ${whereQuery}
      ${orderByQuery}
      ${sizeQuery}
      ${pageQuery};
    `;
    try {
      let queryResult: object;

      if (conditionParams.length == 0 || conditionParams[0] == undefined) {
        queryResult = await this.entityManager.query(queryString);
      } else {
        queryResult = await this.entityManager.query(queryString, conditionParams);
      }
      return {
        statusCode: 100,
        message: `Execute inser data to ${schema} table query sucessful!`,
        data: queryResult
      }
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: `Error when execute script create new table: ${error}`
      }
    }
  }
}
