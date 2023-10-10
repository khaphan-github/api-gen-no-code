import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ExecuteScriptDto } from '../dto/script.dto';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Logger } from '@nestjs/common';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME, EAppTableColumns } from '../../../domain/app.core.domain.script';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import _ from 'lodash';
import { Option, Parser } from 'node-sql-parser';
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

export class CantNotExecuteScript extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number, errorMessage: string) {
    super(`Can not execute script in app id ${appId} because ${errorMessage}`);
    this.name = CantNotUpdateDBScript.name;
    this.statusCode = 608;
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
  private readonly queryBuilder!: RelationalDBQueryBuilder;
  private readonly appCoreDomain!: AppCoreDomain;
  private readonly queryParser!: Parser;

  private readonly logger!: Logger;

  constructor(
    private readonly eventBus: EventBus,
  ) {
    this.queryBuilder = new RelationalDBQueryBuilder(
      APPLICATIONS_TABLE_NAME, APPLICATIONS_TABLE_AVAILABLE_COLUMS
    );
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
    const { params, queryString } = this.queryBuilder.getByQuery({
      conditions: { id: appId.toString() },
      size: 1,
    }, ['database_config', 'use_default_db']);

    // Docs: https://www.npmjs.com/package/node-sql-parser
    // TODO: Database type:
    const parserOptions: Option = {
      database: 'Postgresql'
    }
    const createDBSCriptParser = this.queryParser.astify(script.script, parserOptions);
    const renamedParser = this.appCoreDomain.convertTableNameByAppId(appId, createDBSCriptParser);

    const scriptTableRenamed = this.queryParser.sqlify(renamedParser, parserOptions);
    const executeScriptTransaction = `BEGIN; ${scriptTableRenamed}; COMMIT;`

    // #endregion init necessary static data
    let workspaceTypeormDataSource: DataSource;
    try {
      // #region get application database config using workspace connection;
      workspaceTypeormDataSource = await new DataSource(workspaceConnections).initialize();

      const [appDatabaseConfig, executeUpdateApp] = await Promise.all([
        workspaceTypeormDataSource.query(queryString, params),

        workspaceTypeormDataSource.createQueryBuilder()
          .update(APPLICATIONS_TABLE_NAME)
          .set({
            [EAppTableColumns.CREATE_DB_SCRIPT]: script.script,
            [EAppTableColumns.UPDATED_AT]: new Date(),
            [EAppTableColumns.TABLES_INFO]: JSON.stringify(renamedParser),
          })
          .where(`${APPLICATIONS_TABLE_NAME}.id = :id`, { id: appId })
          .execute()
      ]);
      // #endregion get application database config using workspace connection;

      // #region execute script create database from user
      const { database_config, use_default_db } = appDatabaseConfig[0];

      if (use_default_db) {
        await workspaceTypeormDataSource.query(executeScriptTransaction);
      } else {
        const appTypeOrmDataSource = await new DataSource(database_config).initialize();
        await appTypeOrmDataSource.query(executeScriptTransaction);
        await appTypeOrmDataSource.destroy();
      }
      // #endregion execute script create database from user

      // Execute task gennerate api;
      this.eventBus.publish(
        new ExecutedSQLScriptEvent(workspaceConnections, ownerId, appId, createDBSCriptParser)
      );

      return {
        updateAppResult: executeUpdateApp,
        executeCreateDBScript: true,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new CantNotExecuteScript(appId, error.message);
    } finally {
      await workspaceTypeormDataSource.destroy();
    }
  }
}
