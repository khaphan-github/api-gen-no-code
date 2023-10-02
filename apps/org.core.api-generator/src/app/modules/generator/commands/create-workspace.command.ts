import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { Logger } from '@nestjs/common';
import { DataSource, DataSourceOptions } from "typeorm";
import { AppCoreDomain } from '../../../domain/app.core.domain';
import { JsonIoService } from '../../shared/json.io.service';

export class AppAlreadyExistError extends Error {
  constructor(
    appName: string,
    public readonly statusCode?: number,
    public readonly metadata?: object,
  ) {
    super();
    this.message = `Application ${appName} already exist`;
    this.name = AppAlreadyExistError.name;
  }
}

export class CreateWorkspaceCommand {
  constructor(public readonly CreateWorkspaceDto: CreateWorkspaceDto) { }
}

@CommandHandler(CreateWorkspaceCommand)
export class CreateWorkspaceCommandHandler
  implements ICommandHandler<CreateWorkspaceCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly appCoreDomain!: AppCoreDomain;

  private readonly logger = new Logger(CreateWorkspaceCommandHandler.name);

  constructor(
    private readonly jsonIO: JsonIoService,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.appCoreDomain = new AppCoreDomain();
  }

  /**LOGIC:
   * Kiểm tra kết nối cơ sở dữ liệu, thực hiện kết nối đến cơ sở dữ liệu tương ứng
   * Sau đó tạo các bảng cần thiết:
   * 1. Bảng API - Lưu các API sẽ tạo
   * 2. Bảng Config - Lưu các config của user,
   * 3. Bảng App, Lưu thông tin các ứng dụng con khi user tạo,
   * DOCS: https://orkhan.gitbook.io/typeorm/docs/data-source
   */
  async execute(command: CreateWorkspaceCommand) {
    const { database, databaseName, host, password, port, username } = command.CreateWorkspaceDto;

    try {
      const dbConfig: DataSourceOptions = {
        type: database,
        host: host,
        port: port,
        username: username,
        password: password,
        database: databaseName,
      };

      // TODO: Lưu connection này trên server để query lần sau,
      this.jsonIO.writeJsonFile(this.appCoreDomain.getDefaultWorkspaceId().toString(), dbConfig);

      const typeormDataSource = await new DataSource(dbConfig).initialize();

      const queryInitCoreTable = `
        BEGIN;
          ${this.appCoreDomain.getCreateWorkspaceScript()}
          ${this.appCoreDomain.getCreateApisTableScript()}
          ${this.appCoreDomain.getCreateApplicationScript()}
        COMMIT;
      `
      await typeormDataSource.query(queryInitCoreTable);

      // TODO: CHECK IF THIS CONFIG INSERT YEt -> update;
      const insertConfig = this.appCoreDomain.insertWorkspace({
        database_config: dbConfig,
        ownerId: 'test_owner_id',
      });

      return typeormDataSource.query(insertConfig.query, insertConfig.params);;
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }
}
