import { Field, ObjectType } from '@nestjs/graphql';
import { FacultyDto } from 'src/modules/faculty/dto/faculty.dto';

@ObjectType()
export class UpdateLecturerDto {
  @Field(() => String, { nullable: true })
  lecturer_id?: string;

  @Field(() => String, { nullable: true })
  display_name?: string;

  @Field(() => String, { nullable: true })
  mscb?: string;

  @Field(() => String, { nullable: true })
  faculty_id?: string;

  @Field(() => FacultyDto, { nullable: true })
  faculty?: FacultyDto;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  learning_position?: string;

  @Field(() => Date, { nullable: true })
  birth_date?: Date;

  @Field(() => Boolean, { nullable: true })
  gender?: boolean;

  @Field(() => String, { nullable: true })
  learning?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  ngach?: string;

  @Field(() => String, { nullable: true })
  position?: string;

  @Field(() => Number, { nullable: true })
  total_point?: number;
}
