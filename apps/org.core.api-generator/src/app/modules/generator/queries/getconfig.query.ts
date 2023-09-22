import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JsonIoService } from '../../shared/json.io.service';

export class GetConfigQuery { }
@QueryHandler(GetConfigQuery)
export class GetConfigQueryHandler
  implements IQueryHandler<GetConfigQuery>
{
  constructor(private readonly jsonIoService: JsonIoService) { }
  async execute() {
    const coreConfigFilePath = 'core.config.db/core.config.db.json';
    return this.jsonIoService.readJsonFile(coreConfigFilePath)
  }
}
