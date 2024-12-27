import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryArgs } from 'src/common/args/query.arg';
import { BaseService } from 'src/common/services/BaseService';
import { filterQuery } from 'src/common/utils/filterQuery';
import { paginateByQuery } from 'src/common/utils/paginate';
import { FindOptionsRelations, Repository } from 'typeorm';
import { FacultyService } from '../faculty/faculty.service';
import { LecturerDto } from './dto/lecturer.dto';
import { Lecturer } from './entities/lecturer.entity';
@Injectable()
export class LecturerService extends BaseService<Lecturer> {
  constructor(
    @InjectRepository(Lecturer) private repo: Repository<Lecturer>,
    private readonly facultyService: FacultyService,
  ) {
    super();
  }

  relations: FindOptionsRelations<Lecturer> = {
    faculty: true,
  };

  async findAll({ filter, pagination, sort }: QueryArgs) {
    return paginateByQuery(
      filterQuery<Lecturer>(
        Lecturer,
        this.repo
          .createQueryBuilder()
          .leftJoin('Lecturer.classes', 'Class')
          .leftJoin('Class.points', 'Point')
          .leftJoin('Class.subject', 'Subject')
          .leftJoin('Subject.faculty', 'Faculty')
          .leftJoin('Class.semester', 'Semester'),
        filter,
        sort,
      )
        .select('Lecturer.lecturer_id', 'lecturer_id')
        .addSelect('Lecturer.display_name', 'display_name')
        .addSelect('Lecturer.email', 'email')
        .addSelect('Lecturer.birth_date', 'birth_date')
        .addSelect('Lecturer.faculty_id', 'faculty_id')
        .addSelect('Lecturer.gender', 'gender')
        .addSelect('Lecturer.learning', 'learning')
        .addSelect('Lecturer.learning_position', 'learning_position')
        .addSelect('Lecturer.mscb', 'mscb')
        .addSelect('Lecturer.ngach', 'ngach')
        .addSelect('Lecturer.phone', 'phone')
        .addSelect('Lecturer.position', 'position')
        .addSelect('Lecturer.username', 'username')
        .addSelect('AVG(Point.point / Point.max_point)', 'total_point')
        .andWhere('Point.max_point != 0')
        .addGroupBy('Lecturer.lecturer_id'),
      pagination,
      filter,
      { isRaw: true },
    );
  }

  findOne(id: string): Promise<Lecturer> {
    return this.repo.findOne({ where: { lecturer_id: id } });
  }

  async findByName(name: string): Promise<Lecturer> | null {
    console.log({ name });
    const result = await this.repo
      .createQueryBuilder('lecturer')
      .innerJoinAndSelect('lecturer.faculty', 'faculty')
      .where('LOWER(lecturer.display_name) = LOWER(:name)', { name })
      .getOne();

    return result;
  }

  async mapLecturer(name: string) {
    const lecturer = await this.findByName(name);
    if (!lecturer) {
      const defaultLecturer = this.repo.create({
        display_name: name,
        faculty: await this.facultyService.createDefault(),
      });
      await this.repo.save(defaultLecturer);
      return new LecturerDto(defaultLecturer);
    }
    return new LecturerDto(lecturer);
  }

  async findOrCreateLecturer(display_name: string, faculty_id: string) {
    let lecturer = await this.repo.findOne({
      where: { display_name, faculty_id },
    });
    if (!lecturer) {
      lecturer = this.repo.create({ display_name, faculty_id });
      return this.repo.save(lecturer);
    }
    return new LecturerDto(lecturer);
  }
}
