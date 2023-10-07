import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { AST } from "node-sql-parser";
import { DataSourceOptions } from "typeorm";

export class CreateCoreTablesEvent {
  constructor(
    public readonly workspaceConnections: DataSourceOptions,
    public readonly ownerId: string,
    public readonly appId: number,
    public readonly tableInfo: AST | AST[],
  ) { }
}

@EventsHandler(CreateCoreTablesEvent)
export class CreateCoreTablesEventHandler implements IEventHandler<CreateCoreTablesEvent> {
  private readonly logger = new Logger(CreateCoreTablesEventHandler.name);

  async handle() {
    this.logger.log(CreateCoreTablesEventHandler.name);
  }
}
