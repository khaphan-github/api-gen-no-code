import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GENERATED_APIS_AVAILABLE_COLUMNS, GENERATED_APIS_TABLE_NAME } from '../../../domain/pgsql/app.core.domain.pg-script';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AST } from 'node-sql-parser';
import { ApisCoreDomain } from '../../../domain/core/api.core.domain';
import { RelationalDBQueryBuilder } from '../../../domain/pgsql/pg.relationaldb.query-builder';

export class TaskGenerateAPIsCommand {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly ownerId: string,
    public readonly appId: number,
    public readonly tableInfo: AST | AST[],
  ) { }
}

@CommandHandler(TaskGenerateAPIsCommand)
export class TaskGenerateAPIsCommandHandler
  implements ICommandHandler<TaskGenerateAPIsCommand>
{
  private readonly apiCoreDomain!: ApisCoreDomain;
  private readonly queryBuilder!: RelationalDBQueryBuilder;

  private readonly logger!: Logger;

  constructor() {
    this.apiCoreDomain = new ApisCoreDomain();
    this.queryBuilder = new RelationalDBQueryBuilder(
      GENERATED_APIS_TABLE_NAME, GENERATED_APIS_AVAILABLE_COLUMNS
    );
    this.logger = new Logger(TaskGenerateAPIsCommandHandler.name);
  }

  async execute(command: TaskGenerateAPIsCommand) {
    const { appId, tableInfo, workspaceConnections } = command;

    const apis = this.apiCoreDomain.extractApisFromTableInfo(appId, 'secret_kkey', tableInfo);
    const { params, queryString } = this.queryBuilder.insertMany(apis, ['id']);

    let workspaceTypeormDataSource: DataSource;
    try {
      workspaceTypeormDataSource = await new DataSource(workspaceConnections).initialize();
      const queryResult = await workspaceTypeormDataSource.query(queryString, params);
      await workspaceTypeormDataSource?.destroy();
      return queryResult;
    } catch (error) {
      await workspaceTypeormDataSource?.destroy();
      this.logger.error(error);
      return false;
    }
  }
}