import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JsonIoService } from '../../shared/json.io.service';

export class GetAppUserConfigQuery {
  public
}
@QueryHandler(GetAppUserConfigQuery)
export class GetAppUserConfigQueryHandler
  implements IQueryHandler<GetAppUserConfigQuery>
{

  constructor(
    private readonly jsonIoService: JsonIoService,
  ) { }
  async execute() {
    const coreConfigFilePath = 'core.config.db/core.config.db.json';
    const postgresDbCofig = 'core.config.db/postgres.data-type.json';

    return {
      appConfig: this.jsonIoService.readJsonFile(coreConfigFilePath),
      postgresDbConfig: this.jsonIoService.readJsonFile(postgresDbCofig)
    }
  }
}
