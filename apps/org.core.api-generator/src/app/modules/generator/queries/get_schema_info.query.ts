import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { Logger } from '@nestjs/common';
import { CreateDataCommandHandler } from '../../crud-pg/commands/create..command';
import { JsonIoService } from '../../shared/json.io.service';

export class GetSchemaInfoQuery {
  constructor(
    public readonly appid: string,
    public readonly schema: string,
  ) { }
}
@QueryHandler(GetSchemaInfoQuery)
export class GetSchemaInfoQueryHandler
  implements IQueryHandler<GetSchemaInfoQuery>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly relationalDBQueryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(CreateDataCommandHandler.name);

  constructor(
    private readonly jsonIoService: JsonIoService
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }
  async execute(query: GetSchemaInfoQuery) {
    const { appid, schema } = query;
    const tableName = this.dbQueryDomain.getTableName(appid, schema);
    // Get config:
    // #region get app config;
    const fileConfigByAppName = this.dbQueryDomain.getAppConfigJsonFileName(appid);
    const isExitedApp = this.jsonIoService.fileExists(fileConfigByAppName);
    if (!isExitedApp) {
      throw new Error(`Applications ${appid} does not exist!`);
    }

    
    // #endregion get app config;
    try {
      // TODO:
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: error
      }
    }
  }
}
