import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ClassResponseDto } from 'src/modules/class/dto/response/Class.response.dto';
import { CriteriaDto } from 'src/modules/criteria/dto/response/CriteriaDto';
import { Point } from '../../entities/point.entity';

@ObjectType()
export class PointDto {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Float, { nullable: true })
  maxPoint?: number;

  @Field(() => Float, { nullable: true })
  point?: number;

  @Field(() => String, { nullable: true })
  classId?: string;

  @Field(() => ClassResponseDto, { nullable: true })
  class?: ClassResponseDto;

  @Field(() => String, { nullable: true })
  criteriaId?: string;

  @Field(() => CriteriaDto, { nullable: true })
  criteria?: CriteriaDto;

  constructor(entity: Point) {
    this.point = entity?.point;
    this.classId = entity?.class_id;
    this.criteriaId = entity?.criteria_id;
    this.id = entity?.point_id;
    this.criteria = new CriteriaDto(entity?.criteria)
  }
}
