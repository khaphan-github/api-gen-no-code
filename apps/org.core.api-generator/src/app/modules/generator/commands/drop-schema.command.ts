import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';

export class DropSchemaCommand {
  constructor(
    public readonly appId: string,
    public readonly schema: string,
  ) { }
}
@CommandHandler(DropSchemaCommand)
export class DropSchemaCommandHandler
  implements ICommandHandler<DropSchemaCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly relationalDBQueryBuilder!: RelationalDBQueryBuilder;
  private readonly logger = new Logger(DropSchemaCommandHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }
  async execute(command: DropSchemaCommand) {
    const { appId, schema } = command;
    const tableName = this.dbQueryDomain.getTableName(appId, schema);
    this.relationalDBQueryBuilder.setTableName(tableName);

    try {
      const { queryString } = this.relationalDBQueryBuilder.dropTable();
      await this.entityManager.query(queryString);
    } catch (error) {
      this.logger.error(error);
      return {
        statusCode: 101,
        message: `${error}`
      }
    }
  }
}
