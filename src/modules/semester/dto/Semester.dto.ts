import { Field, ObjectType } from '@nestjs/graphql';
import { Semester } from '../entities/semester.entity';

@ObjectType()
export class SemesterDto {
  @Field(() => String, { nullable: true })
  id: string;

  @Field(() => String, { nullable: true })
  displayName: string;

  @Field(() => String, { nullable: true })
  type: string;

  @Field(() => String, { nullable: true })
  year: string;

  constructor(entity?: Semester) {
    this.id = entity?.semester_id;
    this.displayName = entity?.display_name;
    this.type = entity?.type;
    this.year = entity?.year;
  }
}
