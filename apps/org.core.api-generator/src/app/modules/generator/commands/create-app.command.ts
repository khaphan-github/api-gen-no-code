import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAppDto } from '../dto/create-app.dto';
import { JsonIoService } from '../../shared/json.io.service';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { Logger } from '@nestjs/common';
import { DataSource } from "typeorm";
import { AppCoreDomain } from '../../../domain/app.core.domain';

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

export class CreateAppCommand {
  constructor(public readonly createAppDto: CreateAppDto) { }
}

@CommandHandler(CreateAppCommand)
export class CreateAppCommandHandler
  implements ICommandHandler<CreateAppCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly appCoreDomain!: AppCoreDomain;

  private readonly logger = new Logger(CreateAppCommandHandler.name);

  constructor(
    private readonly jsonIoService: JsonIoService
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
  async execute(command: CreateAppCommand) {
    const { databaseName, host, password, port, username } = command.createAppDto;

    try {
      const typeormDataSource = await new DataSource({
        type: 'postgres',
        host: host,
        port: port,
        username: username,
        password: password,
        database: databaseName,
      }).initialize();

      const queryInitCoreTable = `
        ${this.appCoreDomain.createAPITableSQLScriptPG()}
        ${this.appCoreDomain.createAppTableSQLScriptPG()}
        ${this.appCoreDomain.createHostSQLScriptPG()}
      `
      await typeormDataSource.query(queryInitCoreTable);

      // TODO: Execute script insert config to table config;
      const insertConfig = this.appCoreDomain.insertDbConfig({
        databaseName: databaseName,
        databaseType: 'postgres',
        host: host,
        ownerId: 'test_user_id',
        password: password,
        port: port,
        username: username,
      });

      await typeormDataSource.query(insertConfig.query, insertConfig.params);

      return true;
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }
}
