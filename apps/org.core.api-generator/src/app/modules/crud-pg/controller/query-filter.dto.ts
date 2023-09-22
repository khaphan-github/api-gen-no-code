import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class QueryFilterDto {
  @ApiProperty({
    description: 'Permisions',
    default: '7138b822-9482-4808-8b41-67aee04b63f7',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
