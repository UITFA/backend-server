import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { PaginationDto } from "src/common/dto/request/PageRequestDto";

export class GetCommentsDto {
  @IsString()
  @IsOptional()
  filter?: string;

  @IsString()
  @IsOptional()
  sentiment?: string;

  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}
