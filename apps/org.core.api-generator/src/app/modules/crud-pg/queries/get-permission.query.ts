import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetDataByFilterQuery {
  constructor(public readonly param: any) { }
}
@QueryHandler(GetDataByFilterQuery)
export class GetDataByFilterQueryHandler
  implements IQueryHandler<GetDataByFilterQuery>
{
  async execute(query: GetDataByFilterQuery): Promise<any[]> {
    return []
  }
}
