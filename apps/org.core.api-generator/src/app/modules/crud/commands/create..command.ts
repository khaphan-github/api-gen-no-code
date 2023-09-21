import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateDataCommand {
  constructor(public readonly data: object) { }
}
@CommandHandler(CreateDataCommand)
export class CreateDataCommandHandler
  implements ICommandHandler<CreateDataCommand>
{

  async execute(command: CreateDataCommand) {
    return [];
  }
}
