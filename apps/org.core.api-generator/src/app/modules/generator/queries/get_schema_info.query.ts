import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME, EAppTableColumns } from '../../../domain/app.core.domain.script';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';

export class GetSchemaInfoByAppIdQuery {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly appid: string,
    public readonly ownerId: string,
  ) { }
}
@QueryHandler(GetSchemaInfoByAppIdQuery)
export class GetSchemaInfoByAppIdQueryHandler
  implements IQueryHandler<GetSchemaInfoByAppIdQuery>
{
  private readonly queryBuilder!: RelationalDBQueryBuilder;

  private readonly logger!: Logger;

  constructor() {
    this.queryBuilder =
      new RelationalDBQueryBuilder(APPLICATIONS_TABLE_NAME, APPLICATIONS_TABLE_AVAILABLE_COLUMS);

    this.logger = new Logger(GetSchemaInfoByAppIdQueryHandler.name);
  }
  async execute(query: GetSchemaInfoByAppIdQuery) {
    const { appid, ownerId, workspaceConnections } = query;
    try {
      const { queryString, params } = this.queryBuilder.getByQuery(
        {
          conditions: {
            and: [
              { [EAppTableColumns.ID]: appid.toString() },
              { [EAppTableColumns.OWNER_ID]: ownerId },
            ]
          }
        },
        [
          EAppTableColumns.ID,
          EAppTableColumns.DATABASE_CONFIG,
          EAppTableColumns.USE_DEFAULT_DB,
        ]);

      const workspaceTypeormDataSource = await new DataSource(workspaceConnections).initialize();
      const queryResult = (await workspaceTypeormDataSource.query(queryString, params))[0];

      if (queryResult[EAppTableColumns.USE_DEFAULT_DB]) {
        // workspaceTypeormDataSource.query(this.queryBuilder.getSchemaInfo())
      }
      // TODO: Get connection by appId: use this connection to connect to this database 
      // Get table informations:

    } catch (error) {
      //  
    }
  }
}
