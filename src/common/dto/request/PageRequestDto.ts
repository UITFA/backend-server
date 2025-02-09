import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @Type(() => Number)
  page: number = 0; 

  @IsNumber()
  @Type(() => Number)
  size: number = 100;
}