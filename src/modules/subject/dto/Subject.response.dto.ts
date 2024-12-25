import { Field, ObjectType } from '@nestjs/graphql';
import { Subject } from '../entities/subject.entity';

@ObjectType()
export class SubjectResponseDto {
  @Field()
  subject_id: string;

  @Field({ nullable: true })
  display_name: string;

  @Field({ nullable: true })
  faculty_id: string;

  @Field({ nullable: true })
  total_point: number;

  constructor(entity?: Subject) {
    this.subject_id = entity?.subject_id;
    this.display_name = entity?.display_name;
    this.faculty_id = entity?.faculty_id;
    this.total_point = entity?.total_point;
  }
}
