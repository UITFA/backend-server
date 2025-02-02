import { Field, ObjectType } from '@nestjs/graphql';
import { Gender } from 'src/common/constants/gender';
import { FacultyDto } from 'src/modules/faculty/dto/faculty.dto';

@ObjectType()
export class UpdateLecturerDto {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  mscb?: string;

  @Field(() => String, { nullable: true })
  facultyId?: string;

  @Field(() => FacultyDto, { nullable: true })
  faculty?: FacultyDto;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  learningPosition?: string;

  @Field(() => Date, { nullable: true })
  dateOfBirth?: Date;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

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
  totalPoint?: number;

  constructor(
    displayName?: string,
    mscb?: string,
    username?: string,
    learningPosition?: string,
    dateOfBirth?: Date,
    gender?: Gender,
    email?: string,
    phone?: string,
    ngach?: string,
    position?: string,
    facultyId?: string,
    faculty?: FacultyDto,
    id?: string,
    totalPoint?: number,
    learning?: string,
  ) {
    this.dateOfBirth = dateOfBirth;
    this.displayName = displayName;
    this.email = email;
    this.faculty = faculty;
    this.facultyId = facultyId;
    this.gender = gender;
    this.id = id;
    this.learning = learning;
    this.learningPosition = learningPosition;
    this.mscb = mscb;
    this.ngach = ngach;
    this.phone = phone;
    this.totalPoint = totalPoint;
    this.username = username;
    this.position = position;
  }
}
