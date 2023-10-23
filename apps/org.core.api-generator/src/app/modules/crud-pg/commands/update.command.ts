import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

export class UpdateDataCommand {
  constructor(
    public readonly appId: string,
    public readonly schema: string,
    public readonly id: string | number,
    public readonly data: Partial<{ [key: string]: object }>,
    public readonly tableInfo: object[],
  ) { }
}
@CommandHandler(UpdateDataCommand)
export class UpdateDataCommandHandler
  implements ICommandHandler<UpdateDataCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly relationalDBQueryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(UpdateDataCommandHandler.name);
  constructor(
    // @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }
  async execute(command: UpdateDataCommand) {
    const { appId, data, id, schema, tableInfo } = command;

    // TODO Query available columns use cache or other;
    const validColumns = this.dbQueryDomain.getTableColumnNameArray(tableInfo, 'column_name');
    const tableName = this.dbQueryDomain.getTableName(appId, schema);

    this.relationalDBQueryBuilder.setTableName(tableName);
    this.relationalDBQueryBuilder.setColumns(validColumns);

    try {
      const { queryString, params } = this.relationalDBQueryBuilder.update('id', id, data);
      // const queryResult = await this.entityManager.query(queryString, params);
      // return queryResult[0];
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: `${error}`
      }
    }
  }
}
