import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JsonIoService } from '../../shared/json.io.service';
import { DataSourceOptions } from 'typeorm';
import _ from 'lodash';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
// #region error
export class WorkspaceConnectionNotFound extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(workspaceId: string | number) {
    super(`Workspace ${workspaceId} connection not found`);
    this.name = WorkspaceConnectionNotFound.name;
    this.statusCode = 604;
  }
}

export class WorkspaceIdShouldNotBeEmpty extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor() {
    super(`workspaceId should not be empty`);
    this.name = WorkspaceIdShouldNotBeEmpty.name;
    this.statusCode = 601
  }
}
// #endregion error

export class GetWorkspaceConnectionQuery {
  constructor(
    public readonly workspaceId: string | number,
  ) { }
}
@QueryHandler(GetWorkspaceConnectionQuery)
export class GetWorkspaceConnectionQueryHandler
  implements IQueryHandler<GetWorkspaceConnectionQuery>
{
  constructor(
    private readonly jsonIO: JsonIoService,
  ) { }
  // TODO: In future need to chage way to get this connetions.
  // @return database connection of workspace
  execute(query: GetWorkspaceConnectionQuery): Promise<DataSourceOptions> {
    const { workspaceId } = query;
    if (_.isNil(workspaceId)) {
      return Promise.reject(new WorkspaceIdShouldNotBeEmpty());
    }

    let workspaceDBConfig: DataSourceOptions | PromiseLike<DataSourceOptions>;

    try {
      workspaceDBConfig =
        this.jsonIO.readJsonFile<DataSourceOptions>(workspaceId.toString());
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }

    if (_.isNil(workspaceDBConfig)) {
      return Promise.reject(new WorkspaceConnectionNotFound(workspaceId));
    }

    return Promise.resolve(workspaceDBConfig);
  }
}
