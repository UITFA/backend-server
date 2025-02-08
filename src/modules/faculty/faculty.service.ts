import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterArgs } from 'src/common/args/filter.arg';
import { PaginationArgs } from 'src/common/args/pagination.arg';
import { SortArgs } from 'src/common/args/sort.arg';
import { BaseService } from 'src/common/services/BaseService';
import { filterQuery } from 'src/common/utils/filterQuery';
import { paginateByQuery } from 'src/common/utils/paginate';
import { FindOptionsRelations, Repository } from 'typeorm';
import { FacultyDto } from './dto/faculty.dto';
import { Faculty } from './entities/faculty.entity';

@Injectable()
export class FacultyService extends BaseService<Faculty> {
  constructor(@InjectRepository(Faculty) private repo: Repository<Faculty>) {
    super();
  }

  relations: FindOptionsRelations<Faculty> = { lecturers: true };

  async findAll(
    filter: FilterArgs,
    pagination: PaginationArgs,
    sort?: SortArgs,
  ) {
    return paginateByQuery(
      filterQuery<Faculty>(
        Faculty,
        this.repo
          .createQueryBuilder()
          .innerJoin('Faculty.subjects', 'Subject')
          .leftJoin('Subject.classes', 'Class')
          .leftJoin('Class.lecturer', 'Lecturer')
          .leftJoin('Class.points', 'Point')
          .leftJoin('Point.criteria', 'Criteria')
          .leftJoin('Criteria.semester', 'Semester'),
        filter,
        sort,
      )
        .select('Faculty.faculty_id', 'faculty_id')
        .addSelect('Faculty.display_name', 'display_name')
        .addSelect('Faculty.full_name', 'full_name')
        .groupBy('Faculty.faculty_id'),
      pagination,
      filter,
      { isRaw: true },
    );
  }

  findOne(id: string) {
    return this.repo.findOne({
      where: { faculty_id: id },
    });
  }

  async createDefault() {
    const defaultFaculty = this.repo.create({
      display_name: 'công nghệ phần mềm',
      full_name: 'công nghệ phần mềm',
    });
    return this.repo.save(defaultFaculty);
  }

  async findOrCreateFaculty(facultyName: string) {
    let faculty = await this.repo.findOne({
      where: { display_name: facultyName },
    });
    if (!faculty) {
      faculty = this.repo.create({ display_name: facultyName });
      this.repo.save(faculty);
    }
    return new FacultyDto(faculty);
  }
}
