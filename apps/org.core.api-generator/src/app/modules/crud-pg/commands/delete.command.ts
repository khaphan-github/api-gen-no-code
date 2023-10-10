import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { GetDataQueryHandler } from '../queries/get-by-conditions.query';
import { Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';

export class DeleteDataCommand {
  constructor(
    public readonly appid: string,
    public readonly schema: string,
    public readonly id: number,
    public readonly tableInfo: object[],
  ) { }
}
@CommandHandler(DeleteDataCommand)
export class DeleteDataCommandHandler
  implements ICommandHandler<DeleteDataCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly relationalDBQueryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(GetDataQueryHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }

  async execute(command: DeleteDataCommand) {
    const { appid, id, schema, tableInfo } = command;
    const tableName = this.dbQueryDomain.getTableName(appid, schema);

    // TODO Query available columns use cache or other;
    const validColumns = this.dbQueryDomain.getTableColumnNameArray(tableInfo, 'column_name');

    this.relationalDBQueryBuilder.setTableName(tableName);
    this.relationalDBQueryBuilder.setColumns(validColumns);
    try {
      const { queryString, params } = this.relationalDBQueryBuilder.deleteBy('id', id);

      await this.entityManager.query(queryString, params);
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: `Error when execute script delete record by id ${id}: ${error}`
      }
    }
  }
}
