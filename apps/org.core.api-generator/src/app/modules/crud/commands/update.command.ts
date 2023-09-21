import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateDataCommand {
  constructor(public readonly data: object) { }
}
@CommandHandler(UpdateDataCommand)
export class UpdateDataCommandHandler
  implements ICommandHandler<UpdateDataCommand>
{

  async execute(command: UpdateDataCommand) {
    return [];
  }
}
