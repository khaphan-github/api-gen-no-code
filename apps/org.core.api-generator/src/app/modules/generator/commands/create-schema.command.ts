import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateSchemaCommand {
  constructor(public readonly data: object) { }
}
@CommandHandler(CreateSchemaCommand)
export class CreateSchemaCommandHandler
  implements ICommandHandler<CreateSchemaCommand>
{

  async execute(command: CreateSchemaCommand) {
    return [];
  }
}
