import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { EntityManager } from 'typeorm';
import { DbQueryDomain } from '../../../domain/db.query.domain';
import { RelationalDBQueryBuilder, TableAttribute } from '../../../domain/relationaldb.query-builder';

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
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
    this.relationalDBQueryBuilder = new RelationalDBQueryBuilder();
  }

  async execute(command: CreateSchemaCommand) {
    const { schemaName, appId, attributes } = command;
    const tableName = this.dbQueryDomain.getTableName(appId, schemaName);

    this.relationalDBQueryBuilder.setTableName(tableName);
    try {

      const { queryString, } = this.relationalDBQueryBuilder.createTable(attributes);
      const queryResult = await this.entityManager.query(queryString);

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
