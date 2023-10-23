import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CantNotExecuteScript, ExecuteScriptCommand } from "../commands/execute-script.command";

import { GetSQLConnectionQuery } from "../queries/get-asserts-sql-connections.query";
import { GetSQLScriptQuery } from "../queries/get-asserts-sql-script.query";
import { CreateWorkspaceCommand } from "../commands/create-workspace.command";
import { CreateApplicationCommand } from "../commands/create-app.command";

@Injectable()
export class SQLToAPIService implements OnApplicationBootstrap {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  onApplicationBootstrap() {
    this.executeScriptFromSqlFile();
  }

  //#region api to sql
  executeScriptFromSqlFile = async () => {
    const ownerID = `anonymus_19293`;
    const appID = 1;

    const [connection, script] = await Promise.all([
      this.queryBus.execute(new GetSQLConnectionQuery()),
      this.queryBus.execute(new GetSQLScriptQuery()),
    ]);

    console.log(connection);

    await this.commandBus.execute(new CreateWorkspaceCommand({
      database: connection.type, // <-- type
      databaseName: connection.database,
      host: connection?.host ?? 'john.db.elephantsql.com',
      password: connection.password,
      port: connection.port,
      username: connection.username,
    }));

    await this.commandBus.execute(new CreateApplicationCommand(ownerID, {
      appName: '',
      database: '',
      databaseName: '',
      host: '',
      password: '',
      port: 1,
      useDefaultDb: true,
      username: '',
      workspaceId: 1,
    }));

    try {
      const executeResult = await this.commandBus.execute(
        new ExecuteScriptCommand(connection, appID, ownerID, { script: script })
      );
      console.log(executeResult);
    } catch (error) {
      //
      console.log(error);
    }
  }
  //#endregion api to sql
} 