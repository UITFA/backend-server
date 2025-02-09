import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Class } from '../../entities/class.entity';

@ObjectType()
export class ClassResponseDto {
  @Field(() => String)
  class_id: string;

  @Field()
  display_name: string;

  @Field()
  semester_id: string;

  @Field()
  program: string;

  @Field()
  class_type: string;

  @Field()
  subject_id: string;

  @Field()
  lecturer_id: string;

  @Field(() => Int)
  total_student: number;

  @Field(() => Int)
  participating_student: number;

  constructor(entity?: Class) {
    this.class_id = entity?.class_id;
    this.display_name = entity?.display_name;
    this.semester_id = entity?.semester_id;
    this.program = entity?.program;
    this.class_type = entity?.class_type;
    this.subject_id = entity?.subject_id;
    this.lecturer_id = entity?.lecturer_id;
    this.total_student = entity?.total_student;
    this.participating_student = entity?.participating_student;
  }
}
