import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CriteriaProperty {
  @Field({ nullable: true })
  class_type: string;

  @Field(() => Int, { nullable: true })
  num: number;
}
