import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { GetDataQueryHandler } from '../queries/get-one.query';
import { Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

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

  private readonly logger = new Logger(GetDataQueryHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
  }
  async execute(command: DeleteDataCommand) {
    const { appid, id, schema } = command;
    const tableName = this.dbQueryDomain.getTableName(appid, schema);

    const queryString = `
      DELETE FROM ${tableName}
      WHERE id = $1
    `;
    
    try {
      await this.entityManager.query(queryString, [id]);
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: `Error when execute script delete record by id ${id}: ${error}`
      }
    }
  }
}
