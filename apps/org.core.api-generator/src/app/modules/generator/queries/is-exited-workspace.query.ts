import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { Logger } from '@nestjs/common';

export class IsExistedWorkspaceQuery { }
@QueryHandler(IsExistedWorkspaceQuery)
export class IsExistedWorkspaceQueryHandler
  implements IQueryHandler<IsExistedWorkspaceQuery>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly logger = new Logger(IsExistedWorkspaceQueryHandler.name);

  constructor() {
    this.dbQueryDomain = new DbQueryDomain();
  }

  async execute() {
    return {
      isExisted: true,
      woskspaceId: 0,
    };
  }
}
