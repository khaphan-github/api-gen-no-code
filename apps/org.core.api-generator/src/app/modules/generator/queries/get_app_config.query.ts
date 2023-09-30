import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JsonIoService } from '../../shared/json.io.service';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { Logger } from '@nestjs/common';

export class GetAppConfigQuery { }
@QueryHandler(GetAppConfigQuery)
export class GetAppConfigQueryHandler
  implements IQueryHandler<GetAppConfigQuery>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly logger = new Logger(GetAppConfigQueryHandler.name);

  constructor(
    private readonly jsonIoService: JsonIoService,
  ) {
    this.dbQueryDomain = new DbQueryDomain();

  }
  async execute() {
    // TODO:  Get list of apps // get by user id, optional;
    // owner.
    return [{
      id: 314124,
      appName: 'App1',
      database: 'pg',
    },
    {
      id: 354124,
      appName: 'app2',
      database: 'mysql',
    }]
  }
}
