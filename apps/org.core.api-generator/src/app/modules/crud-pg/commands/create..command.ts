import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { QueryBuilderResult, RelationalDBQueryBuilder } from '../../../domain/pgsql/pg.relationaldb.query-builder';
import { InvalidColumnOfTableError } from '../errors/invalid-table-colums.error';
import { checkObjectsForSameKey } from '../../../lib/utils/check-array-object-match-key';
import NodeCache from 'node-cache';
import { ApplicationModel } from '../../../domain/models/code-application.model';
import { NotFoundApplicationById } from '../../generator/commands/execute-script.command';
import { EmptyRecordWhenInsertError } from '../errors/empty-record-when-insert.error';
import { DataToInsertNotHaveSameKeyError } from '../errors/data-insert-not-have-have-key.error';
import { CanNotInsertNewRecordError } from '../errors/can-not-insert-new-record.errror';
import { ExecutedSQLQueryEvent } from '../events/executed-query.event';

export class CreateDataCommand {
  constructor(
    public readonly appInfo: ApplicationModel,
    public readonly tableInfo: object[],

    public readonly appId: string,
    public readonly schema: string,
    public readonly data: Array<Partial<{ [key: string]: object }>>,
  ) { }
}
@CommandHandler(CreateDataCommand)
export class CreateDataCommandHandler
  implements ICommandHandler<CreateDataCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly queryBuilderTableInsert!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(CreateDataCommandHandler.name);

  constructor(
    private readonly eventBus: EventBus,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.queryBuilderTableInsert = new RelationalDBQueryBuilder();
  }

  async execute(command: CreateDataCommand) {
    const { appInfo, appId, schema, data, tableInfo } = command;

    if (!appInfo) {
      return Promise.reject(new NotFoundApplicationById(appId, 'CreateDataCommandHandler not found application info'));
    }

    const tableName = this.dbQueryDomain.getTableName(appId, schema);

    if (!data || data.length == 0) {
      return Promise.reject(new EmptyRecordWhenInsertError(appId, tableName));
    }

    if (!checkObjectsForSameKey(data)) {
      return Promise.reject(new DataToInsertNotHaveSameKeyError(appId, tableName))
    }

    const validColumns = this.dbQueryDomain.getTableColumnNameArray(tableInfo, 'column_name');
    this.queryBuilderTableInsert.setTableName(tableName);
    this.queryBuilderTableInsert.setColumns(validColumns);

    // Prepare insert query builder
    let insertQuery: QueryBuilderResult;
    try {
      insertQuery = this.queryBuilderTableInsert.insertMany(data, Object.keys(data[0]));
    } catch (error) {
      return Promise.reject(new InvalidColumnOfTableError(appId, schema, error.message));
    }

    // Execute insert many using defaut connections;
    let workspaceDataSource: DataSource;
    try {
      workspaceDataSource = await new DataSource(appInfo.database_config).initialize();
      const queryResult = await workspaceDataSource.query(insertQuery.queryString, insertQuery.params);
      await workspaceDataSource?.destroy();
      this.eventBus.publish(new ExecutedSQLQueryEvent('CreateDataCommandHandler', insertQuery, queryResult))
      return Promise.resolve(queryResult);
    } catch (error) {
      await workspaceDataSource?.destroy();
      return Promise.reject(new CanNotInsertNewRecordError(appId, schema, error.message));
    }
  }
}
