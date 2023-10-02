import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { JsonIoService } from '../../shared/json.io.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppCoreDomain } from '../../../domain/app.core.domain';
import { APPLICATIONS_TABLE_NAME } from '../../../domain/app.core.domain.script';
import { UnDefineError, WorkspaceConfigNotFound } from './get-workspace.query';
import { Logger } from '@nestjs/common';

export class GetAppsByWorkspaceIdQuery {
  constructor(
    public readonly ownerId: string,
    public readonly workspaceId: number,
  ) { }
}
@QueryHandler(GetAppsByWorkspaceIdQuery)
export class GetAppsByWorkspaceIdQueryHandler
  implements IQueryHandler<GetAppsByWorkspaceIdQuery>
{
  private readonly appCoreDomain!: AppCoreDomain;
  private readonly queryBuilder!: RelationalDBQueryBuilder;
  private readonly logger = new Logger(GetAppsByWorkspaceIdQueryHandler.name);

  constructor(
    private readonly jsonIO: JsonIoService,
  ) {
    this.appCoreDomain = new AppCoreDomain();
    this.queryBuilder = new RelationalDBQueryBuilder();
  }
  async execute(query: GetAppsByWorkspaceIdQuery) {
    const { ownerId, workspaceId } = query;
    try {
      const workspaceDbConfig = this.jsonIO.readJsonFile<DataSourceOptions>(
        this.appCoreDomain.getDefaultWorkspaceId().toString()
      );
      if (workspaceDbConfig) {
        const typeormDataSource = await new DataSource(workspaceDbConfig).initialize();

        this.queryBuilder.setColumns(['id', 'owner_id', 'workspace_id', 'app_name', 'database_config', 'enable']);
        this.queryBuilder.setTableName(APPLICATIONS_TABLE_NAME);

        const { queryString, params } = this.queryBuilder.getByQuery({
          conditions: {
            and: [
              { owner_id: ownerId },
              { workspace_id: workspaceId.toString() },
            ]
          }
        }, ['id', 'workspace_id', 'app_name', 'enable']);

        const queryResult = await typeormDataSource.query(queryString, params);

        return queryResult;
      } else {
        throw new WorkspaceConfigNotFound();
      }
    } catch (error) {
      if (error instanceof WorkspaceConfigNotFound) {
        throw error;
      } else {
        this.logger.error(error);
        throw new UnDefineError(error.message);
      }
    }
  }
}
