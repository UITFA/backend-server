import { ObjectType } from '@nestjs/graphql';
import { Semester } from '../entities/semester.entity';

@ObjectType()
export class SemesterDto {
  id: string;

  displayName: string;

  type: string;

  year: string;

  constructor(entity?: Semester) {
    this.id = entity?.semester_id;
    this.displayName = entity?.display_name;
    this.type = entity?.type;
    this.year = entity?.year;
  }
}
