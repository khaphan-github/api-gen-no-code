import { GetAppsByWorkspaceIdQueryHandler } from "./get-app-by-workspace-id.query";
import { GetCreatedDbScriptByAppIdQueryHandler } from "./get-app-createdb-script.query";
import { GetWorkspaceConnectionQueryHandler } from "./get-workspace-connection.query";
import { GetWorkspaceByIdQueryHandler } from "./get-workspace.query";
import { GetSchemaInfoByAppIdQueryHandler } from "./get_schema_info.query";

export const QueryHandlers = [
  GetSchemaInfoByAppIdQueryHandler,
  GetWorkspaceByIdQueryHandler,
  GetAppsByWorkspaceIdQueryHandler,
  GetWorkspaceConnectionQueryHandler,
  GetCreatedDbScriptByAppIdQueryHandler,
];
