import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AppCoreDomain } from '../../../domain/app.core.domain';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME } from '../../../domain/app.core.domain.script';
import { DataSourceOptions } from 'typeorm';
import { AST } from 'node-sql-parser';

// TODO: Sagas
export class TaskGenerateAPIsCommand {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly ownerId: string,
    public readonly appId: string,
    public readonly tableInfo: AST | AST[],
  ) { }
}

@CommandHandler(TaskGenerateAPIsCommand)
export class TaskGenerateAPIsCommandHandler
  implements ICommandHandler<TaskGenerateAPIsCommand>
{
  private readonly appCoreDomain!: AppCoreDomain;
  private readonly queryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(TaskGenerateAPIsCommandHandler.name);

  constructor() {
    this.appCoreDomain = new AppCoreDomain();
    this.queryBuilder = new RelationalDBQueryBuilder(APPLICATIONS_TABLE_NAME, APPLICATIONS_TABLE_AVAILABLE_COLUMS);
  }

  async execute(command: TaskGenerateAPIsCommand) {
    // 
    const { appId, ownerId, tableInfo, workspaceConnections } = command;
  
    // TODO: Convert table info to api;
  }
}