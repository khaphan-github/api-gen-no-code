import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExecuteScriptDto } from '../dto/script.dto';
import { DataSource, DataSourceOptions, UpdateResult } from 'typeorm';
import { Logger } from '@nestjs/common';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME } from '../../../domain/app.core.domain.script';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';

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

export class ExecuteScriptCommand {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly appId: number | string,
    public readonly script: ExecuteScriptDto,
  ) { }
}

@CommandHandler(ExecuteScriptCommand)
export class ExecuteScriptCommandHandler
  implements ICommandHandler<ExecuteScriptCommand> {
  private readonly queryBuilder = new RelationalDBQueryBuilder();
  private readonly logger = new Logger(ExecuteScriptCommandHandler.name);

  // DOCS: https://orkhan.gitbook.io/typeorm/docs/select-query-builder
  constructor() {
    this.queryBuilder = new RelationalDBQueryBuilder();
    this.queryBuilder.setTableName(APPLICATIONS_TABLE_NAME);
    this.queryBuilder.setColumns(APPLICATIONS_TABLE_AVAILABLE_COLUMS);
  }
  async execute(command: ExecuteScriptCommand) {
    const { appId, script, workspaceConnections } = command;
    try {
      const executeScriptTransaction = `BEGIN; ${script.script} COMMIT;`
      const { params, queryString } = this.queryBuilder.getByQuery({
        conditions: { id: appId.toString() }
      }, ['database_config', 'use_default_db']);

      const workspaceTypeormDataSource = await new DataSource(workspaceConnections).initialize();

      const executeUpdateApp = workspaceTypeormDataSource.createQueryBuilder()
        .update(APPLICATIONS_TABLE_NAME).set({
          'create_db_script': script.script,
          'updated_at': new Date(),
        })
        .where(`${APPLICATIONS_TABLE_NAME}.id = :id`, { id: appId })
        .execute();

      const [appDatabaseConfig, _] = await Promise.all([
        await workspaceTypeormDataSource.query(queryString, params),
        executeUpdateApp,
      ]);

      if (!appDatabaseConfig[0]?.use_default_db) {
        const appTypeOrmDataSource = await new DataSource(appDatabaseConfig[0]?.database_config).initialize();
        await appTypeOrmDataSource.query(executeScriptTransaction);
        await appTypeOrmDataSource.destroy();
      } else {
        await workspaceTypeormDataSource.query(executeScriptTransaction);
      }
      await workspaceTypeormDataSource.destroy();

      return true;
    } catch (error) {
      this.logger.error(error.message);
      throw new CantNotExecuteScript(appId, error.message);
    }
  }
}
