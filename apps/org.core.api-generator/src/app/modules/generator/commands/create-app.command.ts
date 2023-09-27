import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAppDto } from '../dto/create-app.dto';
import { JsonIoService } from '../../shared/json.io.service';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { generateRandomNumber } from '../../../lib/utils/math-random';
import { Logger } from '@nestjs/common';
import { AppAlreadyExistError } from '../errors/create-app.command.error';

export class CreateAppCommand {
  constructor(public readonly createAppDto: CreateAppDto) { }
}
@CommandHandler(CreateAppCommand)
export class CreateAppCommandHandler
  implements ICommandHandler<CreateAppCommand>
{
  private readonly dbQueryDomain!: DbQueryDomain;
  private readonly logger = new Logger(CreateAppCommandHandler.name);

  constructor(private readonly jsonIoService: JsonIoService) {
    this.dbQueryDomain = new DbQueryDomain();
  }

  async execute(command: CreateAppCommand) {
    const { appName, createIfNotExist, database, databaseName, host, password, port, username } = command.createAppDto;

    try {
      const appId = generateRandomNumber(100000, 999999);

      const fileConfigByAppName = this.dbQueryDomain.getAppConfigJsonFileName(appId);
      const isExitedApp = this.jsonIoService.fileExists(fileConfigByAppName);

      if (isExitedApp) {
        throw new AppAlreadyExistError(fileConfigByAppName, 193);
      }

      this.jsonIoService.writeJsonFile(fileConfigByAppName,
        { appId, appName, createIfNotExist, database, databaseName, host, password, port, username }
      );
      return {
        appId: appId,
        configPath: fileConfigByAppName,
      };
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }
}
