import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BulkPointDto {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Float, { nullable: true })
  point?: number;

  @Field(() => String, { nullable: true })
  classId?: string;

  @Field(() => String, { nullable: true })
  criteriaId?: string;

  @Field(() => Int, { nullable: true })
  index?: number;

  constructor(
    point?: number,
    classId?: string,
    criteriaId?: string,
    id?: string,
  ) {
    this.point = point;
    this.classId = classId;
    this.criteriaId = criteriaId;
    this.id = id;
  }
}
