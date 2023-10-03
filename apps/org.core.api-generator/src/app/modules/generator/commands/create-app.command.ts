import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { Logger } from '@nestjs/common';
import { DataSource, DataSourceOptions } from "typeorm";
import { AppCoreDomain } from '../../../domain/app.core.domain';
import { JsonIoService } from '../../shared/json.io.service';
import { CreateApplicationDto } from '../dto/create-app.dto';
import { RelationalDBQueryBuilder } from '../../../domain/relationaldb.query-builder';
import { APPLICATIONS_TABLE_AVAILABLE_COLUMS, APPLICATIONS_TABLE_NAME } from '../../../domain/app.core.domain.script';

export class CreateApplicationCommand {
  constructor(
    public readonly ownerId: string,
    public readonly CreateApplicationDto: CreateApplicationDto,
  ) { }
}

@CommandHandler(CreateApplicationCommand)
export class CreateApplicationCommandHandler
  implements ICommandHandler<CreateApplicationCommand>
{
  private readonly appCoreDomain!: AppCoreDomain;
  private readonly queryBuilder!: RelationalDBQueryBuilder;

  private readonly logger = new Logger(CreateApplicationCommandHandler.name);

  constructor(
    private readonly jsonIO: JsonIoService,
  ) {
    this.appCoreDomain = new AppCoreDomain();
    this.queryBuilder = new RelationalDBQueryBuilder();

  }

  async execute(command: CreateApplicationCommand) {
    const { appName, useDefaultDb, workspaceId, database, databaseName, host, password, port, username }
      = command.CreateApplicationDto;

    try {
      // Get config workspace datbase
      const workspaceDbConfig = this.jsonIO.readJsonFile<DataSourceOptions>(
        this.appCoreDomain.getDefaultWorkspaceId().toString()
      );
      if (workspaceDbConfig) {
        this.queryBuilder.setColumns(APPLICATIONS_TABLE_AVAILABLE_COLUMS);
        this.queryBuilder.setTableName(APPLICATIONS_TABLE_NAME);
        let query = '';
        let queryParams = [];
        const responseColumns = ['id', 'workspace_id', 'app_name', 'enable', 'use_default_db', 'updated_at'];
        if (useDefaultDb) {
          const { queryString, params } = this.queryBuilder.insert({
            owner_id: command.ownerId,
            app_name: appName,
            workspace_id: workspaceId,
            enable: true,
            use_default_db: true,
            database_config: workspaceDbConfig,
          }, responseColumns);

          query = queryString;
          queryParams = params;
        } else {

          const databaseConfig = {
            type: database,
            host: host,
            port: port,
            username: username,
            password: password,
            database: databaseName,
          };

          const { queryString, params } = this.queryBuilder.insert({
            owner_id: command.ownerId,
            app_name: appName,
            workspace_id: workspaceId,
            enable: true,
            use_default_db: false,
            database_config: databaseConfig,
          }, responseColumns);

          query = queryString;
          queryParams = params;
        }
        const typeormDataSource = await new DataSource(workspaceDbConfig).initialize();

        const queryResult = await typeormDataSource.query(query, queryParams);

        return queryResult[0];
      } else {
        throw new Error(`Json file workspace config not found`);
      }
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: error.message
      }
    }
  }
}