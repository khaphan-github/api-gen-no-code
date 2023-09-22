import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { DbQueryDomain } from '../../../domain/db.query.domain';

export class CreateDataCommand {
  constructor(
    public readonly appId: string,
    public readonly schema: string,
    public readonly data: Partial<{ [key: string]: object }>
  ) { }
}
@CommandHandler(CreateDataCommand)
export class CreateDataCommandHandler
  implements ICommandHandler<CreateDataCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;

  private readonly logger = new Logger(CreateDataCommandHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
  }
  async execute(command: CreateDataCommand) {
    const { appId, schema, data } = command;

    const columns = Object.keys(data);
    const values = Object.values(data);

    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const tableName = this.dbQueryDomain.getTableName(appId, schema);

    const queryString = `
     INSERT INTO ${tableName} (${columns.join(', ')}) 
     VALUES (${placeholders})
     RETURNING *;
    `;
    try {
      const queryResult = await this.entityManager.query(queryString, values);

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
