import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { QueryParamDataDto } from '../../crud-pg/controller/query-filter.dto';
import { AppCoreDomain } from '../../../domain/app.core.domain';
import { JsonIoService } from '../../shared/json.io.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { WORKSPACE_TABLE_NAME } from '../../../domain/app.core.domain.script';

export class WorkspaceConfigNotFound extends Error {
  constructor() {
    super(`Json file workspace config not found`);
  }
}
export class UnDefineError extends Error {
  constructor(message: string) {
    super(`Error when get workspace by id: ${message}`);
  }
}

export class GetWorkspaceByIdQuery {
  constructor(
    public readonly id: string,
    public readonly queryDto: QueryParamDataDto,
  ) { }
}

@QueryHandler(GetWorkspaceByIdQuery)
export class GetWorkspaceByIdQueryHandler
  implements IQueryHandler<GetWorkspaceByIdQuery>
{
  private readonly appCoreDomain!: AppCoreDomain;
  private readonly queryBuilder!: RelationalDBQueryBuilder;
  private readonly logger = new Logger(GetWorkspaceByIdQueryHandler.name);

  constructor(
    private readonly jsonIO: JsonIoService,
  ) {
    this.appCoreDomain = new AppCoreDomain();
    this.queryBuilder = new RelationalDBQueryBuilder();
  }

  async execute() {
    try {
      const workspaceDbConfig = this.jsonIO.readJsonFile<DataSourceOptions>(
        this.appCoreDomain.getDefaultWorkspaceId().toString()
      );
      if (workspaceDbConfig) {
        const typeormDataSource = await new DataSource(workspaceDbConfig).initialize();

        this.queryBuilder.setColumns(['database_config']);
        this.queryBuilder.setTableName(WORKSPACE_TABLE_NAME);

        const { queryString, params } = this.queryBuilder.getByQuery({}, ['database_config']);
        const queryResult = await typeormDataSource.query(queryString, params);

        return queryResult[0]?.database_config;
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
