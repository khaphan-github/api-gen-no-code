import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ConnectToServerDTO } from '../dto/connect-to-server.dto';

@Injectable()
export class ManageApiService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  getServerInfo(body: ConnectToServerDTO) {
    // TODO Validate clien tid;
    // TODO: GetNumberOfAPI;
    // TODO: Get number of table;
    return null;
  }


}
