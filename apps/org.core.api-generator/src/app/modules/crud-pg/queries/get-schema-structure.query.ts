import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

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

  private readonly logger = new Logger(GetSchemaStructureQueryHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
  }

  async execute(query: GetSchemaStructureQuery): Promise<object> {
    const { appid, schema } = query;

    const tableName = this.dbQueryDomain.getTableName(appid, schema).replace('public.', '');

    const queryString = `
        SELECT *
        FROM information_schema.columns 
        WHERE table_name = $1;
    `;
    try {
      const queryResult = await this.entityManager.query(queryString, [tableName]);

      return {
        statusCode: 100,
        message: `Get table information success! table ${tableName} `,
        data: queryResult
      }
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: `Error when get table information! table: ${error}`
      }
    }
  }
}
