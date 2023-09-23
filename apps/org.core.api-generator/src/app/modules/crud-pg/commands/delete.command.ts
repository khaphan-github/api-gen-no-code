import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { GetDataQueryHandler } from '../queries/get-one.query';
import { Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { GetSchemaStructureQuery } from '../queries/get-schema-structure.query';

export class DeleteDataCommand {
  constructor(
    public readonly appid: string,
    public readonly schema: string,
    public readonly id: number,
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
    private readonly queryBus: QueryBus,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }

  async execute(command: DeleteDataCommand) {
    const { appid, id, schema } = command;
    const tableName = this.dbQueryDomain.getTableName(appid, schema);

    // TODO Query available columns use cache or other;
    const tableInfo = await this.queryBus.execute(new GetSchemaStructureQuery(appid, schema));
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
