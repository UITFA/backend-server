import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SemesterRequestDto {
  type: string;

  year: string;

  constructor(type?: string, year?: string) {
    this.type = type;
    this.year = year;
  }
}
