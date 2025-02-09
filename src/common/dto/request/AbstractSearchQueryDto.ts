import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ToArrayTransformer } from 'src/transformers/convert-to-array.transformer';
import { MAXIMUM_LIMIT_GET_LIST } from '../../constants/maximum-limit-get-list';
import { OrderBy } from '../../constants/order';

export class AbstractSearchQueryDto {
  @Max(MAXIMUM_LIMIT_GET_LIST, { message: 'Max limit is 100' })
  @Min(1, { message: 'Min limit is 1' })
  @IsInt({ message: 'Limit must be a number' })
  @IsOptional()
  limit = 10;

  @Min(0, { message: 'Min offset is 0' })
  @IsInt({ message: 'Offset must be a number' })
  @IsOptional()
  offset = 0;

  @ToArrayTransformer()
  @IsOptional()
  sort: string[] = [];

  @ToArrayTransformer()
  @IsEnum(OrderBy, {
    each: true,
    message: `Order must be one of the following values: ${Object.values(OrderBy).join(', ')}`,
  })
  @IsOptional()
  order: OrderBy[] = [];

  @IsString({ message: 'keyword must be a string' })
  @IsOptional()
  keyword: string;
}


