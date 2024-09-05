import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryArgs } from 'src/common/args/query.arg';
import { BaseService } from 'src/common/services/BaseService';
import { filterQuery } from 'src/common/utils/filterQuery';
import { paginateByQuery } from 'src/common/utils/paginate';
import { DeepPartial, FindOptionsRelations, Repository } from 'typeorm';
import { Lecturer } from './entities/lecturer.entity';
import { LecturerDto } from './dto/lecturer.dto';
import { UpdateLecturerDto } from './dto/request/update-lecturer.dto';
import { normalizeName } from 'src/common/utils/utils';
import { Role } from '../user/enums/role.enum';
import { v4 as uuidv4 } from 'uuid';
import { FacultyService } from '../faculty/faculty.service';
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

  findByName(display_name: string): Promise<Lecturer> {
    return this.repo
      .createQueryBuilder('lecturer')
      .where('LOWER(TRIM(lecturer.display_name)) = LOWER(:name)', {
        name: normalizeName(display_name),
      })
      .getOne();
  }

  async update(
    lecturer: UpdateLecturerDto,
    name: string,
  ): Promise<LecturerDto> {
    const lecturerEntity = await this.findByName(name);
    if (!lecturerEntity) {
      const defaultLecturer = this.repo.create({
        display_name: name,
        lecturer_id: '605',
        faculty: await this.facultyService.create(),
      });
      await this.repo.save(defaultLecturer);
      return new LecturerDto(defaultLecturer);
    }
    Object.assign(lecturerEntity, lecturer);
    const result = await this.repo.save(lecturerEntity);
    return new LecturerDto(result);
  }
}
