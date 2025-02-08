import { Field, Int, ObjectType } from '@nestjs/graphql';
import { SemesterDto } from 'src/modules/semester/dto/Semester.dto';
import { Criteria } from '../../entities/criteria.entity';
import { PointDto } from 'src/modules/point/dto/response/PointDto';

@ObjectType()
export class CriteriaDto {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => Int, { nullable: true })
  index?: number;

  @Field(() => String, { nullable: true })
  semesterId?: string;

  @Field(() => SemesterDto, { nullable: true })
  semester?: SemesterDto;

  @Field(() => [PointDto], { nullable: true })
  points?: PointDto[];

  constructor(entity: Criteria) {
    this.displayName = entity?.display_name;
    this.index = entity?.index;
    this.semester = new SemesterDto(entity?.semester);
    this.semesterId = entity?.semester_id;
    this.id = entity?.criteria_id;
    this.points = entity?.points?.map((point) => new PointDto(point));
  }
}
