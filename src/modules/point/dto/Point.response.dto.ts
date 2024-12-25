import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Point {
  @Field(() => String)
  point_id: string;

  @Field(() => Int)
  max_point: number;

  @Field(() => Float)
  point: number;

  @Field()
  class_id: string;
}
