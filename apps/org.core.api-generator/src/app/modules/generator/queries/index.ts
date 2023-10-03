import { GetAppsByWorkspaceIdQueryHandler } from "./get-app-by-workspace-id.query";
import { GetAppUserConfigQueryHandler } from "./get-user-config.query";
import { GetWorkspaceConnectionQueryHandler } from "./get-workspace-connection.query";
import { GetWorkspaceByIdQueryHandler } from "./get-workspace.query";
import { GetAppConfigQueryHandler } from "./get_app_config.query";
import { GetSchemaInfoQueryHandler } from "./get_schema_info.query";

export const QueryHandlers = [
  GetAppConfigQueryHandler,
  GetSchemaInfoQueryHandler,
  GetAppUserConfigQueryHandler,
  GetWorkspaceByIdQueryHandler,
  GetAppsByWorkspaceIdQueryHandler,
  GetWorkspaceConnectionQueryHandler,
];
