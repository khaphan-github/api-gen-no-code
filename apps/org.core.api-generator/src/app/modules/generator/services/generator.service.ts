import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetAppConfigQuery } from "../queries/get_app_config.query";
import { CreateAppDto } from "../dto/create-app.dto";
import { CreateAppCommand } from "../commands/create-app.command";
import { DropSchemaCommand } from "../commands/drop-schema.command";

@Injectable()
export class GeneratorService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  getAppConfig() {
    return this.queryBus.execute(new GetAppConfigQuery());
  }

  createApp(createAppDto: CreateAppDto) {
    return this.commandBus.execute(new CreateAppCommand(createAppDto));
  }

  dropSchema(appId: string, schema: string,) {
    return this.commandBus.execute(new DropSchemaCommand(appId, schema));
  }
} 