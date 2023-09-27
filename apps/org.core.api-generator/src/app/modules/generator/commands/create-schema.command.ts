import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { AvailableDB, DbQueryDomain } from '../../../domain/db.query.domain';
import { RelationalDBQueryBuilder, TableAttribute } from '../../../domain/relationaldb.query-builder';
import { JsonIoService } from '../../shared/json.io.service';
import { PostgresConnectorService } from '../../../infrastructure/connector/pg-connector.service';
import NodeCache from 'node-cache';
import { AppConfigDomain } from '../../../domain/app.core.domain';

export class CreateSchemaCommand {
  @ApiProperty({ example: 'products' })
  @IsNotEmpty()
  @IsString()
  public readonly schemaName: string;

  @ApiProperty({ example: '1283971894' })
  @IsNotEmpty()
  @IsString()
  public readonly appId: string;

  @ApiProperty({
    example: [
      {
        name: "product_name",
        dataTypeFormat: 'VARCHAR(40)'
      },
      {
        name: "description",
        dataTypeFormat: 'VARCHAR(60)'
      }
    ]
  })
  @IsArray()
  @IsNotEmpty()
  public readonly attributes: Array<TableAttribute>;
}

@CommandHandler(CreateSchemaCommand)
export class CreateSchemaCommandHandler
  implements ICommandHandler<CreateSchemaCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly relationalDBQueryBuilder!: RelationalDBQueryBuilder;
  private readonly logger = new Logger(CreateSchemaCommandHandler.name);

  constructor(
    private readonly pgConnector: PostgresConnectorService,
    private readonly jsonIoService: JsonIoService,
    private readonly nodeCache: NodeCache,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }

  async execute(command: CreateSchemaCommand) {
    const { schemaName, appId, attributes } = command;
    const tableName = this.dbQueryDomain.getTableName(appId, schemaName);

    // #region get app config;
    const appConfigFileName = this.dbQueryDomain.getAppConfigJsonFileName(appId);
    const appConfigCacheKey = this.dbQueryDomain.getCahingAppConfig(appId);
    let appConfig = this.nodeCache.get<AppConfigDomain>(appConfigCacheKey);
    if (!appConfig) {
      appConfig = this.jsonIoService.readJsonFile<AppConfigDomain>(appConfigFileName);
      this.nodeCache.set(appConfigCacheKey, appConfig);
    }
    // #endregion get app config;

    // Execute using appConfig
    this.relationalDBQueryBuilder.setTableName(tableName);

    try {
      let queryResult: unknown;
      const { queryString, } = this.relationalDBQueryBuilder.createTable(attributes);

      switch (appConfig.database) {
        case AvailableDB.PG:
          this.pgConnector.setConfig(this.dbQueryDomain.getPGDbConfig(appConfig));
          queryResult = await this.pgConnector.execute(queryString);
          break;

        case AvailableDB.MYSQL:
          console.log('MYSQL');
          break;

        case AvailableDB.MSSQL:
          console.log('MSSQL');
          break;
        case AvailableDB.ORACLE:
          console.log('ORACLE');
          break;
      }
      return queryResult;
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: `Error when execute script create new table: ${error}`
      }
    }
  }
}
