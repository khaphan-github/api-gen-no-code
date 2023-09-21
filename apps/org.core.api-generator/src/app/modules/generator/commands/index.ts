import { AlterSchemaCommandHandler } from "./alter-schema.command";
import { CreateSchemaCommandHandler } from "./create-schema.command";
import { DropSchemaCommandHandler } from "./drop-schema.command";

export const CommandHandlers = [
  CreateSchemaCommandHandler,
  DropSchemaCommandHandler,
  AlterSchemaCommandHandler,
];
