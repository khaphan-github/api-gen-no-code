import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CanNotExecuteCreateDbByScriptError, ExecuteScriptCommand } from "../commands/execute-script.command";

import { GetSQLConnectionQuery } from "../queries/get-asserts-sql-connections.query";
import { GetSQLScriptQuery } from "../queries/get-asserts-sql-script.query";
import { CreateWorkspaceCommand } from "../commands/create-workspace.command";
import { CreateApplicationCommand } from "../commands/create-app.command";
import { WORKSPACE_VARIABLE } from "../../shared/variables/workspace.variable";

@Injectable()
export class SQLToAPIService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SQLToAPIService.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  onApplicationBootstrap() {
    this.executeScriptFromSqlFile();
  }

  //#region api to sql
  executeScriptFromSqlFile = async () => {
    const [connection, script] = await Promise.all([
      this.queryBus.execute(new GetSQLConnectionQuery()),
      this.queryBus.execute(new GetSQLScriptQuery()),
    ]);

    this.logger.debug(`Get config database.sql and connection.json success!`);

    await this.commandBus.execute(
      new CreateWorkspaceCommand(
        WORKSPACE_VARIABLE.OWNER_ID,
        {
          database: connection.type, // <-- type
          databaseName: connection.database,
          host: connection?.host,
          password: connection.password,
          port: connection.port,
          username: connection.username,
        },
        WORKSPACE_VARIABLE.WORKSPACE_ID),
    );

    this.logger.debug(`Create workspace ${WORKSPACE_VARIABLE.WORKSPACE_ID} success! `);


    await this.commandBus.execute(new CreateApplicationCommand(
      WORKSPACE_VARIABLE.OWNER_ID,
      {
        appName: WORKSPACE_VARIABLE.APP_NAME,
        database: connection.type,
        databaseName: connection.database,
        host: connection?.host,
        password: connection.password,
        port: connection.port,
        useDefaultDb: true,
        username: connection.username,
        workspaceId: WORKSPACE_VARIABLE.WORKSPACE_ID,
      },
      WORKSPACE_VARIABLE.APP_ID,
    ));

    this.logger.debug(`Create application ${WORKSPACE_VARIABLE.APP_ID} success`);

    try {
      const executeResult = await this.commandBus.execute(
        new ExecuteScriptCommand(
          connection,
          WORKSPACE_VARIABLE.APP_ID,
          WORKSPACE_VARIABLE.OWNER_ID,
          { script: script }
        )
      );
      this.logger.debug(`Execute script success success!`);

      if (executeResult) {
        this.logger.log(`GENNERATE API SUCCESS`);
      }
      console.log(executeResult);
    } catch (error) {
      if (error instanceof CanNotExecuteCreateDbByScriptError) {
        this.logger.log(`Your table and api ready! ^^`);
      }
    }
  }
  //#endregion api to sql
} 