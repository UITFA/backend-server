import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { PageOptionsDto } from './PageOptionDto';

@InputType()
@ArgsType()
export class GetCommentListDto extends PageOptionsDto {
  @Field({ nullable: true })
  semester_id?: string;

  @Field({ nullable: true })
  faculty_id?: string;

  @Field({ nullable: true })
  program?: string;

  @Field({ nullable: true, defaultValue: '' })
  keyword?: string;

  @Field(() => [String], { nullable: true })
  subjects?: string[];

  @Field({ nullable: true })
  criteria_id?: string;

  @Field({ nullable: true, defaultValue: 'LT' })
  class_type?: 'LT' | 'TH1' | 'TH2';

  @Field({ nullable: true })
  lecturer_id?: string;

  @Field({ nullable: true })
  class_id?: string;

  @Field({ nullable: true })
  aspect?: string;

  @Field({ nullable: true })
  sentiment?: string;
}
