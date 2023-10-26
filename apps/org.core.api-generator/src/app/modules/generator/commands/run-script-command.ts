import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource, DataSourceOptions } from "typeorm";
import { AppCoreDomain } from '../../../domain/app.core.domain';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { WORKSPACE_AVAILABLE_COLUMNS, WORKSPACE_TABLE_NAME } from '../../../domain/pgsql/app.core.domain.pg-script';

export class AppAlreadyExistError extends Error {
  constructor(
    public readonly appName: string,
    public readonly statusCode?: number,
    public readonly metadata?: object,
  ) {
    super();
    this.message = `Application ${appName} already exist`;
    this.name = AppAlreadyExistError.name;
  }
}

export class RunScriptCommand {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly script: string
  ) { }
}

@CommandHandler(RunScriptCommand)
export class RunScriptCommandHandler
  implements ICommandHandler<RunScriptCommand>
{
  private readonly appCoreDomain!: AppCoreDomain;
  private readonly queryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(RunScriptCommandHandler.name);

  constructor() {
    this.appCoreDomain = new AppCoreDomain();
    this.queryBuilder = new RelationalDBQueryBuilder(WORKSPACE_TABLE_NAME, WORKSPACE_AVAILABLE_COLUMNS);
  }

  /**LOGIC:
   * Kiểm tra kết nối cơ sở dữ liệu, thực hiện kết nối đến cơ sở dữ liệu tương ứng
   * DOCS: https://orkhan.gitbook.io/typeorm/docs/data-source
   * Need to check when using workspace config to execute query when use API gennergate
   * sql scrip - must be allow select method, and cant not exe data base not in own user
   * */

  async execute(command: RunScriptCommand) {
    const { script, workspaceConnections } = command;

    // TODO: Check SQL query to make source it can't exe cute with dât they have no prermission.

    let typeormDataSource: DataSource;
    try {
      typeormDataSource = await new DataSource(workspaceConnections).initialize();
      const queryResult = await typeormDataSource.query(script);
      return queryResult;
    } catch (error) {
      await typeormDataSource.destroy();
      this.logger.error(error);
      return error;
    } finally {
      await typeormDataSource.destroy();
    }
  }
}
