import { AlterSchemaCommandHandler } from "./alter-schema.command";
import { CreateWorkspaceCommandHandler } from "./create-workspace.command";
import { CreateSchemaCommandHandler } from "./create-schema.command";
import { DropSchemaCommandHandler } from "./drop-schema.command";
import { ExecuteScriptCommandHandler } from "./execute-script.command";
import { CreateApplicationCommandHandler } from "./create-app.command";
import { TaskGenerateAPIsCommandHandler } from "./create-apis-task.command";
import { RunScriptCommandHandler } from "./run-script-command";

export const CommandHandlers = [
  CreateSchemaCommandHandler,
  DropSchemaCommandHandler,
  AlterSchemaCommandHandler,
  ExecuteScriptCommandHandler,
  CreateWorkspaceCommandHandler,
  CreateApplicationCommandHandler,
  TaskGenerateAPIsCommandHandler,
  RunScriptCommandHandler,
];
