import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryArgs } from 'src/common/args/query.arg';
import { BaseService } from 'src/common/services/BaseService';
import { filterQuery } from 'src/common/utils/filterQuery';
import { paginateByQuery } from 'src/common/utils/paginate';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { ClassRequestDto } from './dto/request/Class.request.dto';
import { ClassResponseDto } from './dto/response/Class.response.dto';

@Injectable()
export class ClassService extends BaseService<Class> {
  constructor(@InjectRepository(Class) private repo: Repository<Class>) {
    super();
  }

  relations: FindOptionsRelations<Class> = {
    lecturer: true,
    semester: true,
    subject: {
      faculty: true,
    },
  };

  async findAll({ filter, sort, pagination }: QueryArgs) {
    return paginateByQuery(
      filterQuery<Class>(
        'Class',
        this.repo
          .createQueryBuilder()
          .leftJoin('Class.subject', 'Subject')
          .leftJoin('Class.lecturer', 'Lecturer')
          .leftJoin('Lecturer.faculty', 'Faculty')
          .leftJoin('Class.points', 'Point')
          .leftJoin('Class.semester', 'Semester'),
        filter,
        sort,
      ),
      pagination,
      filter,
      {},
    );
  }

  findOne(id: string): Promise<Class> {
    return this.repo.findOne({
      where: { class_id: id },
    });
  }

  async findOrCreateClassByNameAndSemesterId(classRequest: ClassRequestDto) {
    const classEntity = await this.repo.findOne({
      where: {
        display_name: classRequest.displayName,
        semester_id: classRequest.semesterId,
        subject_id: classRequest.subjectId,
      },
    });
    if (!classEntity) {
      const newClass: Class = this.repo.create({
        display_name: classRequest.displayName,
        semester_id: classRequest.semesterId,
        subject_id: classRequest.subjectId,
        lecturer_id: classRequest.lecturerId,
        program: classRequest.program,
        total_student: classRequest.totalStudent,
        participating_student: classRequest.participant,
        class_type: classRequest.classType,
      });
      await this.repo.save(newClass);
      return new ClassResponseDto(newClass);
    }
    return new ClassResponseDto(classEntity);
  }

  public async findClassesBySubjectId(subjectId): Promise<ClassResponseDto[]> {
    return this.repo.find({ where: { subject_id: subjectId } });
  }
}
