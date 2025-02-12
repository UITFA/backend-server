import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryArgs } from '../../common/args/query.arg';
import { BaseService } from '../../common/services/BaseService';
import { filterQuery } from '../../common/utils/filterQuery';
import { paginateByQuery } from '../../common/utils/paginate';
import { Class } from '../class/entities/class.entity';
import { UpdateCriteriaDto } from './dto/request/UpdateCriteriaDto';
import { Criteria } from './entities/criteria.entity';
import { Semester } from '../semester/entities/semester.entity';

@Injectable()
export class CriteriaService extends BaseService<Criteria> {
  private readonly logger = new Logger(CriteriaService.name);

  constructor(
    @InjectRepository(Criteria) private repo: Repository<Criteria>,
    @InjectRepository(Class) private classRepo: Repository<Class>,
  ) {
    super();
  }

  relations = { semester: true };

  async findAll({ filter, pagination, sort }: QueryArgs) {
    const result = paginateByQuery(
      filterQuery<Criteria>(
        Criteria,
        this.repo
          .createQueryBuilder()
          .leftJoin('Criteria.points', 'Point')
          .leftJoin('Point.class', 'Class')
          .leftJoin('Class.semester', 'Semester')
          .leftJoin('Class.subject', 'Subject')
          .leftJoin('Class.lecturer', 'Lecturer')
          .leftJoin('Subject.faculty', 'Faculty'),
        filter,
        sort,
      )
        .select('Criteria.criteria_id', 'criteria_id')
        .addSelect('Criteria.index', 'index')
        .addSelect('Criteria.semester_id', 'semester_id')
        .addSelect('Criteria.display_name', 'display_name')
        .groupBy('Criteria.criteria_id'),
      pagination,
      filter,
      { isRaw: true },
    );

    return result;
  }

  findOne(id: string): Promise<Criteria> {
    return this.repo.findOne({
      where: { criteria_id: id },
      relations: this.relations,
    });
  }

  async findClassType(criteria_id: string) {
    const criteriaProperties = await this.classRepo
      .createQueryBuilder()
      .leftJoin('Class.points', 'Point')
      .where('Point.criteria_id = :criteria_id', { criteria_id })
      .select('Class.class_type', 'class_type')
      .addSelect('COUNT(DISTINCT Class.class_id)', 'num')
      .groupBy('Class.class_type')
      .getRawMany();

    return criteriaProperties;
  }

  async updateOrCreateCriteria(
    updateCriteriaDto: UpdateCriteriaDto,
    semester: Semester,
  ): Promise<Criteria> {
    let criteria = await this.repo.findOne({
      where: {
        display_name: updateCriteriaDto.displayName,
        semester,
        semester_id: semester?.semester_id,
      },
    });
    if (!criteria) {
      criteria = this.repo.create({
        index: updateCriteriaDto.index,
        display_name: updateCriteriaDto.displayName,
        semester: semester,
        semester_id: semester?.semester_id,
      });
      await this.repo.save(criteria);
    }
    return criteria;
  }

  async findCriteriaByIndexAndSemester(index: number, semesterId: string) {
    return this.repo.findOne({ where: { semester_id: semesterId, index } });
  }
}
