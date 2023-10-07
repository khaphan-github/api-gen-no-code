import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { AST } from "node-sql-parser";
import { DataSourceOptions } from "typeorm";

export class GenerateApisEvent {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly ownerId: string,
    public readonly appId: number,
    public readonly tableInfo: AST | AST[],
  ) { }
}

@EventsHandler(GenerateApisEvent)
export class GenerateApisEventHandler implements IEventHandler<GenerateApisEvent> {
  private readonly logger = new Logger(GenerateApisEventHandler.name);

  async handle() {
    this.logger.log(GenerateApisEventHandler.name);
  }
}
