import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DataSource, DataSourceOptions } from 'typeorm';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { WorkspaceConnectionShouldNotBeEmpty } from '../../shared/errors/workspace-connection-empty.error';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME, EAppTableColumns } from '../../../domain/pgsql/app.core.domain.pg-script';
import { CanNotGetAppInforError } from '../errors/can-not-get-app-info.error';
import { AppCoreDomain } from '../../../domain/app.core.domain';
import NodeCache from 'node-cache';
import { ApplicationModel } from '../../../domain/models/code-application.model';


export class GetAppInfoByAppId {
  constructor(
    public readonly workspaceConnection: DataSourceOptions,
    public readonly appId: string | number,
  ) { }
}

@QueryHandler(GetAppInfoByAppId)
export class GetAppInfoByAppIdHandler
  implements IQueryHandler<GetAppInfoByAppId>
{

  private readonly queryBuilderTableApp!: RelationalDBQueryBuilder;
  private readonly appCoreDomain!: AppCoreDomain;

  constructor(
    private readonly nodeCache: NodeCache,
  ) {
    this.queryBuilderTableApp = new RelationalDBQueryBuilder(
      APPLICATIONS_TABLE_NAME, APPLICATIONS_TABLE_AVAILABLE_COLUMS,
    );
    this.appCoreDomain = new AppCoreDomain();

  }

  async execute(query: GetAppInfoByAppId): Promise<ApplicationModel> {
    const { workspaceConnection, appId } = query;
    // Cache get app info
    const appCacheKey = this.appCoreDomain.getAppInfoCacheKey(appId.toString());
    const appInfo = this.nodeCache.get(appCacheKey) as ApplicationModel;
    if (appInfo) {
      return Promise.resolve(appInfo);
    }

    if (!workspaceConnection) {
      return Promise.reject(new WorkspaceConnectionShouldNotBeEmpty());
    }

    let workspaceTypeOrmDataSource: DataSource;
    const queryAppScript = this.queryBuilderTableApp.getByQuery({
      conditions: { [EAppTableColumns.ID]: appId.toString(), }
    });

    try {
      workspaceTypeOrmDataSource = await new DataSource(workspaceConnection).initialize();
      const appDBConfig = await workspaceTypeOrmDataSource.query(
        queryAppScript.queryString, queryAppScript.params
      );
      this.nodeCache.set(appCacheKey, appDBConfig[0]);
      await workspaceTypeOrmDataSource?.destroy();
      return Promise.resolve(appDBConfig[0]);
    } catch (error) {
      await workspaceTypeOrmDataSource?.destroy();
      return Promise.reject(new CanNotGetAppInforError(appId, error.message));
    }
  }
}
