import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CommentDto {
  @Field()
  id: string;

  @Field()
  content: string;

  // @Field()
  // type: string;

  @Field()
  aspect: string;
  @Field()
  sentiment: string;

  @Field(() => Int)
  semester_id;

  @Field(() => Int)
  class_id;

  constructor(
    content?: string,
    // type?: string,
    semesterId?: string,
    classId?: string,
    aspect?: string,
    sentiment?: string,
  ) {
    this.content = content;
    // this.type = type;
    this.aspect = aspect;
    this.sentiment = sentiment;
    this.semester_id = semesterId;
    this.class_id = classId;
  }
}
