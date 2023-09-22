import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteDataCommand {
  constructor(public readonly data: object) { }
}
@CommandHandler(DeleteDataCommand)
export class DeleteDataCommandHandler
  implements ICommandHandler<DeleteDataCommand>
{

  async execute(command: DeleteDataCommand) {
    return [];
  }
}
