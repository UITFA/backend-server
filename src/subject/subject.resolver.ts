import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { FilterArgs } from 'src/common/args/filter.arg';
import { QueryArgs as QueryArgs } from 'src/common/args/query.arg';
import { GroupedPoint } from 'src/point/dto/PaginatedGroupedPoint';
import { PointService } from 'src/point/point.service';
import { PaginatedSubject } from './dto/PaginatedSubject';
import { Subject } from './entities/subject.entity';
import { SubjectService } from './subject.service';
import { FacultyService } from 'src/faculty/faculty.service';
import { Faculty } from 'src/faculty/entities/faculty.entity';

@Resolver(() => Subject)
export class SubjectResolver {
  constructor(
    private readonly subjectService: SubjectService,
    private readonly pointService: PointService,
    private readonly facultyService: FacultyService,
  ) {}

  @Query(() => PaginatedSubject, { name: 'subjects' })
  findAll(@Args() queryArgs: QueryArgs) {
    return this.subjectService.findAll(queryArgs);
  }

  @Query(() => Subject, { name: 'subject', nullable: true })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.subjectService.findOne(id);
  }

  @ResolveField(() => [GroupedPoint], { nullable: true })
  async points(@Parent() subject: Subject, @Args() filter: FilterArgs) {
    const { subject_id } = subject;
    const result = await this.pointService.findAll(
      { ...filter, subjects: [subject_id] },
      { size: 100, page: 0 },
      'Criteria',
    );
    return result.data;
  }

  @ResolveField(() => Faculty, { nullable: true })
  async faculty(@Parent() subject: Subject) {
    const { faculty_id } = subject;
    return this.facultyService.findOne(faculty_id);
  }
}
