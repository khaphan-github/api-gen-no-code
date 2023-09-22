import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { EntityManager } from 'typeorm';
import { DbQueryDomain } from '../../../domain/db.query.domain';

export class TableAttribute {
  name: string;
  dataTypeFormat: string;
}

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
  private readonly logger = new Logger(CreateSchemaCommandHandler.name);
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.dbQueryDomain = new DbQueryDomain();
  }

  async execute(command: CreateSchemaCommand) {
    const { schemaName, appId, attributes } = command;
    try {
      // TODO: Validate request attribute
      const attributeQuery = attributes.map((attribute) =>
        ` ${attribute.name} ${attribute.dataTypeFormat} `).join(", ");

      const tableName = this.dbQueryDomain.getTableName(appId, schemaName);
      const queryString = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id SERIAL PRIMARY KEY,
          ${attributeQuery}
        );
      `;
      await this.entityManager.query(queryString);
      return {
        statusCode: 100,
        message: 'Execute create table query sucessful!',
        data: {
          schema: tableName,
        }
      }
    } catch (error) {
      this.logger.error(error);

      return {
        statusCode: 101,
        message: `Error when execute script create new table: ${error}`
      }
    }
  }
}
