import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryArgs } from 'src/common/args/query.arg';
import { BaseService } from 'src/common/services/BaseService';
import { filterQuery } from 'src/common/utils/filterQuery';
import { paginateByQuery } from 'src/common/utils/paginate';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Faculty } from '../faculty/entities/faculty.entity';
import { FacultyService } from '../faculty/faculty.service';
import { LecturerDto } from './dto/lecturer.dto';
import { UpdateLecturerDto } from './dto/request/update-lecturer.dto';
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

  async findOrCreateLecturer(display_name: string, faculty: Faculty) {
    let lecturer = await this.repo.findOne({
      where: { display_name },
    });
    if (!lecturer) {
      lecturer = this.repo.create({
        display_name,
        faculty,
        faculty_id: faculty?.faculty_id,
      });
      await this.repo.save(lecturer);
    }
    return lecturer;
  }

  async updatOrCreateLecturer(
    updateLecturerDto: UpdateLecturerDto,
    faculty: Faculty,
  ) {
    let lecturer = await this.repo.findOne({
      where: {
        display_name: updateLecturerDto.displayName,
      },
    });

    if (!lecturer) {
      lecturer = this.repo.create({
        display_name: updateLecturerDto.displayName,
      });
    }

    lecturer.birth_date = updateLecturerDto.dateOfBirth;
    lecturer.display_name = updateLecturerDto.displayName;
    lecturer.email = updateLecturerDto.email;
    lecturer.gender = updateLecturerDto.gender;
    lecturer.learning = updateLecturerDto.learning;
    lecturer.learning_position = updateLecturerDto.learningPosition;
    lecturer.mscb = updateLecturerDto.mscb;
    lecturer.ngach = updateLecturerDto.ngach;
    lecturer.phone = updateLecturerDto.phone;
    lecturer.total_point = updateLecturerDto.totalPoint;
    lecturer.username = updateLecturerDto.username;
    lecturer.position = updateLecturerDto.position;
    lecturer.faculty = faculty;
    lecturer.faculty_id = updateLecturerDto.facultyId;

    await this.repo.save(lecturer);
    return lecturer;
  }

  async updateOrCreateLecturer(
    display_name: string,
    faculty: Faculty,
    avgPoint: string,
  ) {
    let lecturer = await this.repo.findOne({
      where: { display_name },
    });


    if (!lecturer) {
      lecturer = this.repo.create({
        display_name,
        faculty,
        faculty_id: faculty?.faculty_id,
        total_point: avgPoint ? parseFloat(avgPoint) : 0.0,
        point_count: 1,
      });
    } else {
      lecturer.point_count = lecturer.point_count + 1;
      lecturer.total_point = avgPoint
        ? lecturer.total_point + parseFloat(avgPoint)
        : lecturer.total_point;
    }
    await this.repo.save(lecturer);
    return lecturer;
  }
}
