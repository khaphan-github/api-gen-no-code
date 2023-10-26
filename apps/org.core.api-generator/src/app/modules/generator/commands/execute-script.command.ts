import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ExecuteScriptDto } from '../dto/script.dto';
import { DataSource, DataSourceOptions, UpdateResult } from 'typeorm';
import { Logger } from '@nestjs/common';
import { APPLICATIONS_TABLE_NAME, EAppTableColumns } from '../../../domain/pgsql/app.core.domain.pg-script';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import _ from 'lodash';
import { AST, Option, Parser } from 'node-sql-parser';
import { AppCoreDomain } from '../../../domain/app.core.domain';
import { ExecutedSQLScriptEvent } from '../events/execute-sql-create-db.event';

export class CantNotUpdateDBScript extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, errorMessage: string) {
    super(`Can not update database script in app id ${appId} because ${errorMessage}`);
    this.name = CantNotUpdateDBScript.name;
    this.statusCode = 607;
  }
}


export class NullAttributeError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(attribute: string) {
    super(`${attribute} should not be empty`);
    this.name = CantNotUpdateDBScript.name;
    this.statusCode = 609;
  }
}


export class CanNotInitDataSourceConnectionError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(err: string) {
    super(`Can not init data source with connection: ${err}`);
    this.name = CanNotInitDataSourceConnectionError.name;
    this.statusCode = 610;
  }
}


export class NotFoundApplicationById extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(id: string | number, err: string) {
    super(`Not found application by id ${id} because ${err}`);
    this.name = NotFoundApplicationById.name;
    this.statusCode = 611;
  }
}

export class CanNotExecuteCreateDbByScriptError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(id: string | number, err: string) {
    super(`Can not execute generate application by script at app ${id} because ${err}`);
    this.name = CanNotExecuteCreateDbByScriptError.name;
    this.statusCode = 612;
  }
}

export class ExecuteScriptCommand {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly appId: number,
    public readonly ownerId: string,
    public readonly script: ExecuteScriptDto,
  ) { }
}
// DOCS: https://orkhan.gitbook.io/typeorm/docs/select-query-builder
@CommandHandler(ExecuteScriptCommand)
export class ExecuteScriptCommandHandler
  implements ICommandHandler<ExecuteScriptCommand> {
  private readonly appCoreDomain!: AppCoreDomain;
  private readonly queryParser!: Parser;

  private readonly logger!: Logger;

  constructor(
    private readonly eventBus: EventBus,
  ) {
    this.appCoreDomain = new AppCoreDomain();
    this.queryParser = new Parser();

    this.logger = new Logger(ExecuteScriptCommandHandler.name);
  }

  // DONE
  async execute(command: ExecuteScriptCommand) {
    const { appId, ownerId, script, workspaceConnections } = command;

    if (_.isNil(appId)) throw new NullAttributeError('appId');
    if (_.isNil(script.script)) throw new NullAttributeError('script');
    if (_.isNil(workspaceConnections)) throw new NullAttributeError('workspaceConnections');

    // #region init necessary static data

    // Docs: https://www.npmjs.com/package/node-sql-parser
    // TODO: Database type:
    const parserOptions: Option = {
      database: 'Postgresql'
    }

    // #endregion init necessary static data
    let workspaceTypeormDataSource: DataSource;

    try {
      workspaceTypeormDataSource = await new DataSource(workspaceConnections).initialize();
    } catch (error) {
      await workspaceTypeormDataSource?.destroy();
      return Promise.reject(new CanNotInitDataSourceConnectionError(error));
    }

    let scriptTableRenamed: string;
    let renamedParser: AST | AST[];
    let createDBSCriptParser: AST | AST[];

    try {
      createDBSCriptParser = this.queryParser.astify(script.script, parserOptions);
      renamedParser = this.appCoreDomain.convertTableNameByAppId(appId, createDBSCriptParser);
      scriptTableRenamed = this.queryParser.sqlify(renamedParser, parserOptions);
    } catch (error) {
      this.logger.error(error);
    }
    const executeScriptTransaction = `BEGIN; ${scriptTableRenamed}; COMMIT;`

    let executeGenrateDBResult: unknown;
    try {
      await workspaceTypeormDataSource.query(executeScriptTransaction);
    } catch (error) {
      await workspaceTypeormDataSource?.destroy();
      return Promise.reject(new CanNotExecuteCreateDbByScriptError(appId, error.message));
    }

    let executeUpdateAppResult: UpdateResult;
    try {
      executeUpdateAppResult = await workspaceTypeormDataSource.createQueryBuilder()
        .update(APPLICATIONS_TABLE_NAME)
        .set({
          [EAppTableColumns.CREATE_DB_SCRIPT]: script.script,
          [EAppTableColumns.UPDATED_AT]: new Date(),
          [EAppTableColumns.TABLES_INFO]: JSON.stringify(renamedParser),
        })
        .where(`${APPLICATIONS_TABLE_NAME}.id = :id`, { id: appId })
        .execute();
    } catch (error) {
      await workspaceTypeormDataSource?.destroy();
      return Promise.reject(new CantNotUpdateDBScript(appId, error.message));
    } finally {
      await workspaceTypeormDataSource.destroy();
    }

    this.eventBus.publish(
      new ExecutedSQLScriptEvent(workspaceConnections, ownerId, appId, createDBSCriptParser)
    );

    return {
      executeGenrateDBResult: executeGenrateDBResult,
      executeUpdateAppResult: executeUpdateAppResult,
    }
  }
}
