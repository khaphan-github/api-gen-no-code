import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExecuteScriptDto } from '../dto/script.dto';

export class ExecuteScriptCommand {
  constructor(
    public readonly appId: number | string,
    public readonly script: ExecuteScriptDto,
  ) { }
}

@CommandHandler(ExecuteScriptCommand)
export class ExecuteScriptCommandHandler
  implements ICommandHandler<ExecuteScriptCommand>
{

  async execute(command: ExecuteScriptCommand) {
    const { appId, script } = command;

    return [];
  }
}
