import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SemesterRequestDto {
  type: string;

  year: string;

  classType: string;

  constructor(type?: string, year?: string, classType?: string) {
    this.type = type;
    this.year = year;
    this.classType = classType;
  }
}
