import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { GetSchemaStructureQuery } from '../queries/get-schema-structure.query';
import { PostgresConnectorService } from '../../../infrastructure/connector/pg-connector.service';

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
  private readonly relationalDBQueryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(CreateDataCommandHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly pgConnector: PostgresConnectorService,
    private readonly queryBus: QueryBus,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }
  async execute(command: CreateDataCommand) {
    const { appId, schema, data } = command;
    const tableName = this.dbQueryDomain.getTableName(appId, schema);
    // TODO: Get datbase connection info fron app id;

    const tableInfo = await this.queryBus.execute(new GetSchemaStructureQuery(appId, schema));
    const validColumns = this.dbQueryDomain.getTableColumnNameArray(tableInfo, 'column_name');

    this.relationalDBQueryBuilder.setTableName(tableName);
    this.relationalDBQueryBuilder.setColumns(validColumns);

    try {

      const { queryString, params } = this.relationalDBQueryBuilder.insert(data);
      const queryResult = await this.entityManager.query(queryString, params);

      return queryResult;
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: `Error when execute script create new table: ${error}`
      }
    }
  }
}
