import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DropSchemaCommand {
  constructor(public readonly data: object) { }
}
@CommandHandler(DropSchemaCommand)
export class DropSchemaCommandHandler
  implements ICommandHandler<DropSchemaCommand>
{

  async execute(command: DropSchemaCommand) {
    return [];
  }
}
