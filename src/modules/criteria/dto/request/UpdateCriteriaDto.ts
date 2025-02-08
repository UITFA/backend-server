import { Field, Int, ObjectType } from '@nestjs/graphql';
import { SemesterDto } from 'src/modules/semester/dto/Semester.dto';

@ObjectType()
export class UpdateCriteriaDto {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => Int, { nullable: true })
  index?: number;

  @Field(() => String, { nullable: true })
  semesterId?: string;

  @Field(() => SemesterDto, { nullable: true })
  semester?: SemesterDto;

  constructor(
    displayName?: string,
    index?: number,
    semester?: SemesterDto,
    semesterId?: string,
    id?: string,
  ) {
    this.displayName = displayName;
    this.index = index;
    this.semester = semester;
    this.semesterId = semesterId;
    this.id = id;
  }
}
