'use strict';

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AbstractSearchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Transform(Number)
  page: number;

  get skip() {
    return (this.page - 1) * this.take;
  }

  get take() {
    return 10;
  }
}
