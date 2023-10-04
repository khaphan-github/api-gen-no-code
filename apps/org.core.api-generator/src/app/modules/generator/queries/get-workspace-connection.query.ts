import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JsonIoService } from '../../shared/json.io.service';
import { DataSourceOptions } from 'typeorm';
import _ from 'lodash';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import { AppCoreDomain } from '../../../domain/app.core.domain';

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

export class GetWorkspaceConnectionQuery { }

@QueryHandler(GetWorkspaceConnectionQuery)
export class GetWorkspaceConnectionQueryHandler
  implements IQueryHandler<GetWorkspaceConnectionQuery>
{
  private readonly appCoreDomain!: AppCoreDomain;
  constructor(
    private readonly jsonIO: JsonIoService,
  ) {
    this.appCoreDomain = new AppCoreDomain();
  }
  // TODO: In future need to chage way to get this connetions/ get from sheet... same same,
  // DONE
  // @return database connection of workspace
  execute(): Promise<DataSourceOptions> {
    const workspaceId = this.appCoreDomain.getDefaultWorkspaceId();
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
