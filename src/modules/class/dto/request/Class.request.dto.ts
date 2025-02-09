import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ClassRequestDto {
  @Field(() => String)
  displayName: string;

  @Field(() => String)
  semesterId: string;

  @Field(() => String)
  subjectId: string;

  @Field(() => String)
  lecturerId: string;

  @Field(() => String)
  program: string;

  @Field(() => Int)
  totalStudent: number;

  @Field(() => Int)
  participant: number;

  @Field(() => Int)
  classType: string;

  constructor(
    displayName?: string,
    program?: string,
    semesterId?: string,
    subjectId?: string,
    lecturerId?: string,
    totalStudent?: string,
    participant?: string,
    classType?: string,
  ) {
    this.displayName = displayName;
    this.semesterId = semesterId;
    this.subjectId = subjectId;
    this.lecturerId = lecturerId;
    this.program = program;
    this.totalStudent = totalStudent ? parseInt(totalStudent, 10) : null;
    this.participant = participant ? parseInt(participant, 10) : null;
    this.classType = classType;
  }
}
