import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class AlterSchemaCommand {
  constructor(public readonly data: object) { }
}
@CommandHandler(AlterSchemaCommand)
export class AlterSchemaCommandHandler
  implements ICommandHandler<AlterSchemaCommand>
{

  async execute(command: AlterSchemaCommand) {
    return [];
  }
}
