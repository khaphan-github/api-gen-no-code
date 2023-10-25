import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EGeneratedApisTableColumns, GENERATED_APIS_AVAILABLE_COLUMNS, GENERATED_APIS_TABLE_NAME } from '../../../domain/pgsql/app.core.domain.pg-script';
import { Logger } from '@nestjs/common';

export class GetApisByAppIdQuery {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly ownerId: string,
    public readonly appId: number,
  ) { }
}
@QueryHandler(GetApisByAppIdQuery)
export class GetApisByAppIdQueryHandler
  implements IQueryHandler<GetApisByAppIdQuery>
{
  private readonly queryBuilder!: RelationalDBQueryBuilder;
  private readonly logger = new Logger(GetApisByAppIdQueryHandler.name);

  constructor() {
    this.queryBuilder = new RelationalDBQueryBuilder(
      GENERATED_APIS_TABLE_NAME, GENERATED_APIS_AVAILABLE_COLUMNS,
    );
  }
  // DONE
  async execute(query: GetApisByAppIdQuery) {
    const { appId, workspaceConnections } = query;
    let typeormDataSource: DataSource;

    const { params, queryString } = this.queryBuilder.getByQuery({
      conditions: {
        [EGeneratedApisTableColumns.APP_ID]: appId.toString()
      }
    });

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
