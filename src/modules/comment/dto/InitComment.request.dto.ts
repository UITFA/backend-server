import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InitCommentRequestDto {
  @Field()
  content: string;

  @Field()
  semesterId: string;

  @Field()
  classId: string;

  @Field()
  aspect: string;

  @Field()
  sentiment: string;

  constructor(
    content?: string,
    classId?: string,
    semesterId?: string,
    aspect?: string,
    sentiment?: string,
  ) {
    this.content = content;
    this.classId = classId;
    this.semesterId = semesterId;
    this.aspect = aspect;
    this.sentiment = sentiment;
  }
}
