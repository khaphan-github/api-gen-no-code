import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RelationalDBQueryBuilder } from '../../../domain/pgsql/pg.relationaldb.query-builder';
import { DataSource, DataSourceOptions } from 'typeorm';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME, EAppTableColumns } from '../../../domain/pgsql/app.core.domain.pg-script';
import { Logger } from '@nestjs/common';
import { AppCoreDomain } from '../../../domain/pgsql/pg.app.core.domain';

export class GetTableByAppIdQuery {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly ownerId: string,
    public readonly appId: number,
  ) { }
}
@QueryHandler(GetTableByAppIdQuery)
export class GetTableByAppIdQueryHandler
  implements IQueryHandler<GetTableByAppIdQuery>
{
  private readonly queryBuilder!: RelationalDBQueryBuilder;
  private readonly appCoreDomain!: AppCoreDomain;

  private readonly logger = new Logger(GetTableByAppIdQueryHandler.name);

  constructor() {
    this.queryBuilder = new RelationalDBQueryBuilder(
      APPLICATIONS_TABLE_NAME, APPLICATIONS_TABLE_AVAILABLE_COLUMS,
    );
    this.appCoreDomain = new AppCoreDomain();
  }
  // DONE
  async execute(query: GetTableByAppIdQuery) {
    const { appId, ownerId, workspaceConnections } = query;
    let typeormDataSource: DataSource;

    const { params, queryString } = this.queryBuilder.getByQuery({
      conditions: {
        [EAppTableColumns.OWNER_ID]: ownerId.toString(),
        [EAppTableColumns.ID]: appId.toString(),
      }
    }, [
      EAppTableColumns.ID,
      EAppTableColumns.TABLES_INFO,
    ]);

    try {
      typeormDataSource = await new DataSource(workspaceConnections).initialize();
      const queryResult = await typeormDataSource.query(queryString, params);

      return this.appCoreDomain.getTableNameFromParser(queryResult);
    } catch (error) {
      this.logger.error(error);
    } finally {
      await typeormDataSource.destroy();
    }
  }
}
