import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JsonIoService } from '../../shared/json.io.service';
import { DataSourceOptions } from 'typeorm';
import _ from 'lodash';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import { WorkspaceConnectionShouldNotBeEmpty } from '../../shared/errors/workspace-connection-empty.error';
import NodeCache from 'node-cache';

// #region error
export class WorkspaceConnectionNotFound extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(workspaceId: string | number) {
    super(`Workspace ${workspaceId} connection not found`);
    this.name = WorkspaceConnectionNotFound.name;
    this.statusCode = 604;
  }
}
// #endregion error

export class GetWorkspaceConnectionQuery { }

@QueryHandler(GetWorkspaceConnectionQuery)
export class GetWorkspaceConnectionQueryHandler
  implements IQueryHandler<GetWorkspaceConnectionQuery>
{
  constructor(
    private readonly jsonIO: JsonIoService,
    private readonly nodeCache: NodeCache,
  ) {
  }
  // TODO: In future need to chage way to get this connetions/ get from sheet... same same,
  // DONE
  // @return database connection of workspace
  execute(): Promise<DataSourceOptions> {
    // TODO: Get sql confi path
    const workspaceId = `connection.json`;
    if (_.isNil(workspaceId)) {
      return Promise.reject(new WorkspaceConnectionShouldNotBeEmpty());
    }

    const workspaceFromCache = this.nodeCache.get<DataSourceOptions>(workspaceId);

    if (workspaceFromCache) {
      return Promise.resolve(workspaceFromCache);
    }

    let workspaceDBConfig: DataSourceOptions | PromiseLike<DataSourceOptions>;

    try {
      workspaceDBConfig =
        this.jsonIO.readJsonFile<DataSourceOptions>(workspaceId.toString());

      this.nodeCache.set(workspaceId, workspaceDBConfig);
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }

    if (_.isNil(workspaceDBConfig)) {
      return Promise.reject(new WorkspaceConnectionNotFound(workspaceId));
    }

    return Promise.resolve(workspaceDBConfig);
  }
}
