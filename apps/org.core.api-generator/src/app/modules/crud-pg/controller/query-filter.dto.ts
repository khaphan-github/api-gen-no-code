import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RequestParamDataDto {
  @ApiProperty({
    description: 'This is appId you created before create schema',
    default: '44',
    example: 44
  })
  @IsString()
  @IsNotEmpty()
  appid: string;

  @ApiProperty({
    description: 'This is schema you created',
    default: 'swagger_test',
  })
  @IsString()
  @IsNotEmpty()
  schema: string;
}

export class QueryParamDataDto {
  @ApiProperty({
    description: `
      Array of attribute you want select, 
      example your product table have 2 attribute: name, id. 
      you an input [name] or [id] to get return value
    `,
    default: [
      'id'
    ],
  })
  @IsNotEmpty()
  @IsOptional()
  selects: Array<string> = ['id', 'name', 'method'];

  @ApiProperty({
    description: 'Case data have alots you need pagination',
    default: '1',
  })
  @IsNotEmpty()
  page: number;

  @ApiProperty({
    description: 'Limit number of record you want to get',
    default: '10',
  })
  @IsNotEmpty()
  size: number;

  @ApiProperty({
    description: 'Other by attribute you check to sort.',
    default: 'id',
  })
  @IsNotEmpty()
  @IsOptional()
  orderby: string;

  @ApiProperty({
    description: 'Sort attribute follow [desc] to descending and [asc] to ascending by default',
    default: 'asc',
  })
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sort: string;
}
