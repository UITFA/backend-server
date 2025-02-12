import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SemesterDto } from './dto/Semester.dto';
import { SemesterRequestDto } from './dto/Semester.request.dto';
import { Semester } from './entities/semester.entity';

@Injectable()
export class SemesterService {
  constructor(@InjectRepository(Semester) private repo: Repository<Semester>) {}

  async findAll() {
    return (await this.repo.find()).reverse();
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { semester_id: id } });
  }

  async findByCriteria(criteria_id: string): Promise<Semester[]> {
    return this.repo
      .createQueryBuilder()
      .leftJoin('Class', 'Class', 'Class.semester_id = Semester.semester_id')
      .leftJoin('Class.points', 'Point')
      .leftJoin('Point.criteria', 'Criteria')
      .where('Point.criteria_id = :criteria_id', { criteria_id })
      .groupBy('Semester.semester_id')
      .getMany();
  }

  async findSemester(semester: SemesterRequestDto): Promise<SemesterDto> {
    const semesterEntity = await this.repo.findOne({
      where: {
        type: semester.type,
        year: semester.year,
      },
    });
    return new SemesterDto(semesterEntity);
  }

  async createSemester(semester: SemesterRequestDto): Promise<SemesterDto> {
    const semesterEntity = this.repo.create({
      display_name: `${semester.type} ${semester.year}`,
      type: semester.type,
      year: semester.year,
    });
    await this.repo.save(semesterEntity);
    return new SemesterDto(semesterEntity);
  }

  async findOrCreateSemester(semester: SemesterRequestDto) {
    const semesterEntity = await this.repo.findOne({
      where: {
        year: semester.year,
        type: semester.type,
        classType: semester.classType,
      },
    });
    if (!semesterEntity) {
      const newSemester = this.repo.create({
        display_name: `${semester.type} ${semester.year}`,
        type: semester.type,
        year: semester.year,
        classType: semester.classType,
      });
      await this.repo.save(newSemester);
      return newSemester;
    }
    return semesterEntity;
  }

  async findOrCreateSemesterWithoutUnique(semester: SemesterRequestDto) {
    const semesterEntity = await this.repo.findOne({
      where: {
        year: semester.year,
        type: semester.type,
        classType: semester.classType,
      },
    });
    if (!semesterEntity) {
      const newSemester = this.repo.create({
        display_name: `${semester.type} ${semester.year}`,
        type: semester.type,
        year: semester.year,
        classType: semester.classType,
      });
      return this.repo.save(newSemester);
    }
    return semesterEntity;
  }
}
