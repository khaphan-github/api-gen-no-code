import { GetApisByAppIdQueryHandler } from "./get-apis-by-app-id.query";
import { GetAppsByWorkspaceIdQueryHandler } from "./get-app-by-workspace-id.query";
import { GetCreatedDbScriptByAppIdQueryHandler } from "./get-app-createdb-script.query";
import { GetTableByAppIdQueryHandler } from "./get-avaiable-table-by-appId.query";
import { GetWorkspaceConnectionQueryHandler } from "./get-workspace-connection.query";
import { GetWorkspaceByIdQueryHandler } from "./get-workspace.query";
import { GetSchemaInfoByAppIdQueryHandler } from "./get_schema_info.query";
import { GetSQLConnectionQueryHandler } from "./get-asserts-sql-connections.query";
import { GetSQLScriptQueryHandler } from "./get-asserts-sql-script.query";

export const QueryHandlers = [
  GetSchemaInfoByAppIdQueryHandler,
  GetWorkspaceByIdQueryHandler,
  GetAppsByWorkspaceIdQueryHandler,
  GetWorkspaceConnectionQueryHandler,
  GetCreatedDbScriptByAppIdQueryHandler,
  GetApisByAppIdQueryHandler,
  GetTableByAppIdQueryHandler,

  // SQL TO API
];

export const SQLToAPIQueryHandlers = [
  GetSQLConnectionQueryHandler,
  GetSQLScriptQueryHandler,
]