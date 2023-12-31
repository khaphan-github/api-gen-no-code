import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { DataSource, DataSourceOptions } from 'typeorm';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME } from '../../../domain/app.core.domain.script';
import { Logger } from '@nestjs/common';

export class GetAppsByWorkspaceIdQuery {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly ownerId: string,
    public readonly workspaceId: number,
  ) { }
}
@QueryHandler(GetAppsByWorkspaceIdQuery)
export class GetAppsByWorkspaceIdQueryHandler
  implements IQueryHandler<GetAppsByWorkspaceIdQuery>
{
  private readonly queryBuilder!: RelationalDBQueryBuilder;
  private readonly logger = new Logger(GetAppsByWorkspaceIdQueryHandler.name);

  constructor() {
    this.queryBuilder = new RelationalDBQueryBuilder(APPLICATIONS_TABLE_NAME, APPLICATIONS_TABLE_AVAILABLE_COLUMS);
  }
  // DONE
  async execute(query: GetAppsByWorkspaceIdQuery) {
    const { ownerId, workspaceId, workspaceConnections } = query;
    let typeormDataSource: DataSource;

    const { queryString, params } = this.queryBuilder.getByQuery({
      conditions: {
        and: [
          { owner_id: ownerId },
          { workspace_id: workspaceId.toString() },
        ]
      }
    }, ['id', 'workspace_id', 'app_name', 'enable', 'use_default_db', 'updated_at']);

    try {
      typeormDataSource = await new DataSource(workspaceConnections).initialize();
      const queryResult = await typeormDataSource.query(queryString, params);
      
      return queryResult;
    } catch (error) {
      this.logger.error(error);
    } finally {
      typeormDataSource.destroy();
    }
  }
}
