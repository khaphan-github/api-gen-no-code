import { GetAppUserConfigQueryHandler } from "./get-user-config.query";
import { GetAppConfigQueryHandler } from "./get_app_config.query";
import { GetSchemaInfoQueryHandler } from "./get_schema_info.command";

export const QueryHandlers = [
  GetAppConfigQueryHandler,
  GetSchemaInfoQueryHandler,
  GetAppUserConfigQueryHandler,
];
