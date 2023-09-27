import { AlterSchemaCommandHandler } from "./alter-schema.command";
import { CreateAppCommandHandler } from "./create-app.command";
import { CreateSchemaCommandHandler } from "./create-schema.command";
import { DropSchemaCommandHandler } from "./drop-schema.command";
import { ExecuteScriptCommandHandler } from "./execute-script.command";

export const CommandHandlers = [
  CreateSchemaCommandHandler,
  DropSchemaCommandHandler,
  AlterSchemaCommandHandler,
  CreateAppCommandHandler,
  ExecuteScriptCommandHandler,
];
