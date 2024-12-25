import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InitCommentRequestDto {
  @Field()
  content: string;

  @Field()
  semesterId: string;

  @Field()
  classId: string;

  constructor(content?: string, classId?: string, semesterId?: string) {
    this.content = content;
    this.classId = classId;
    this.semesterId = semesterId;
  }
}
