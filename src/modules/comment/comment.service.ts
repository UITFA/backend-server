import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterArgs } from 'src/common/args/filter.arg';
import { PaginationArgs } from 'src/common/args/pagination.arg';
import { filterQuery } from 'src/common/utils/filterQuery';
import { paginateByQuery } from 'src/common/utils/paginate';
import { Repository, UpdateResult } from 'typeorm';
import { InitCommentRequestDto } from './dto/InitComment.request.dto';
import { Comment } from './entities/comment.entity';
import { GetCommentListDto } from './dto/request/GetCommentListDto';

@Injectable()
export class CommentService {
  constructor(@InjectRepository(Comment) private repo: Repository<Comment>) {}

  findAll(
    filter: FilterArgs,
    paginationOptions: PaginationArgs,
    sentiment: string,
  ) {
    const aspect = filter.aspect;

    return paginateByQuery(
      filterQuery<Comment>(
        'Comment',
        this.repo
          .createQueryBuilder()
          .innerJoin('Comment.class', 'Class')
          .innerJoin('Class.subject', 'Subject')
          .innerJoin('Subject.faculty', 'Faculty')
          .innerJoin('Class.semester', 'Semester')
          .innerJoin('Class.lecturer', 'Lecturer'),
        filter,
      )
        .andWhere(
          aspect && aspect != null ? 'Comment.aspect = :aspect' : 'true',
          {
            aspect,
          },
        )
        .andWhere(
          sentiment && sentiment != 'all'
            ? 'Comment.sentiment = :sentiment'
            : 'true',
          {
            sentiment,
          },
        ),
      paginationOptions,
      filter,
      {
        relations: {
          class: true,
        },
      },
    );
  }

  async getQuantity(filter: FilterArgs, sentiment: string) {
    const aspect = filter.aspect;
    return {
      type: sentiment ?? 'all',
      quantity:
        (await filterQuery<Comment>(
          'Comment',
          this.repo
            .createQueryBuilder()
            .innerJoin('Comment.class', 'Class')
            .innerJoin('Class.subject', 'Subject')
            .innerJoin('Subject.faculty', 'Faculty')
            .innerJoin('Class.semester', 'Semester')
            .innerJoin('Class.lecturer', 'Lecturer'),
          filter,
        )
          .andWhere(
            sentiment && sentiment != 'all'
              ? 'Comment.sentitmemt = :sentiment'
              : 'true',
            {
              sentiment,
            },
          )
          .andWhere(aspect ? 'Comment.aspect = :aspect' : 'true', {
            aspect,
          })
          .getCount()) || 0,
    };
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { comment_id: id }, relations: {} });
  }

  async findCommentsByClassIdAndSemesterId(
    classId: string,
    semesterId: string,
  ) {
    return this.repo.findOneBy({ class_id: classId, semester_id: semesterId });
  }

  async deleteCommentsByClassIdAndSemesterId(
    classId: string,
    semesterId: string,
  ) {
    await this.repo.delete({ class_id: classId, semester_id: semesterId });
  }

  async createComment(commentDto: InitCommentRequestDto): Promise<Comment> {
    const comment = this.repo.create({
      display_name: commentDto.content,
      semester_id: commentDto.semesterId,
      class_id: commentDto.classId,
    });
    return this.repo.save(comment);
  }

  async updatePredictComment(
    id,
    aspect: string,
    sentiment: string,
  ): Promise<UpdateResult> {
    const result = await this.repo.update(
      { comment_id: id },
      {
        aspect: aspect,
        sentiment: sentiment,
      },
    );
    return result;
  }

  async findCommentList(getCommentListDto: GetCommentListDto) {
    const filter: FilterArgs = getCommentListDto;
    const paginationOptions: PaginationArgs = getCommentListDto;
    const sentiment: string = getCommentListDto?.sentiment;
    const aspect: string = getCommentListDto?.aspect;

    // const paginationOptions = getCommentListDto
    //   ? { take: undefined, skip: undefined }
    //   : {
    //       take: getCommentListDto.size || 10,
    //       skip: getCommentListDto.skip || 0,
    //     };

    return paginateByQuery(
      filterQuery<Comment>(
        'Comment',
        this.repo
          .createQueryBuilder()
          .innerJoin('Comment.class', 'Class')
          .innerJoin('Class.subject', 'Subject')
          .innerJoin('Subject.faculty', 'Faculty')
          .innerJoin('Class.semester', 'Semester')
          .innerJoin('Class.lecturer', 'Lecturer'),
        getCommentListDto,
      )
        .andWhere(
          aspect && aspect != null ? 'Comment.aspect = :aspect' : 'true',
          {
            aspect,
          },
        )
        .andWhere(
          sentiment && sentiment != 'all'
            ? 'Comment.sentiment = :sentiment'
            : 'true',
          {
            sentiment,
          },
        ),
      paginationOptions,
      filter,
      {
        relations: {
          class: true,
          semester: true,
        },
      },
    );
    // const queryBuilder = this.repo
    //   .createQueryBuilder('Comment')
    //   .innerJoinAndSelect('Comment.class', 'Class')
    //   .innerJoinAndSelect('Class.subject', 'Subject')
    //   .innerJoinAndSelect('Subject.faculty', 'Faculty')
    //   .innerJoinAndSelect('Class.semester', 'Semester')
    //   .innerJoinAndSelect('Class.lecturer', 'Lecturer');

    // if (aspect) {
    //   queryBuilder.andWhere('Comment.aspect = :aspect', { aspect });
    // }

    // if (sentiment && sentiment !== 'all') {
    //   queryBuilder.andWhere('Comment.sentiment = :sentiment', { sentiment });
    // }

    // if (getCommentListDto.semester_id) {
    //   queryBuilder.andWhere('Semester.id = :semester_id', {
    //     semester_id: getCommentListDto.semester_id,
    //   });
    // }

    // if (getCommentListDto.faculty_id) {
    //   queryBuilder.andWhere('Faculty.id = :faculty_id', {
    //     faculty_id: getCommentListDto.faculty_id,
    //   });
    // }

    // if (getCommentListDto.lecturer_id) {
    //   queryBuilder.andWhere('Lecturer.id = :lecturer_id', {
    //     lecturer_id: getCommentListDto.lecturer_id,
    //   });
    // }

    // if (getCommentListDto.program) {
    //   queryBuilder.andWhere('Class.program = :program', {
    //     program: getCommentListDto.program,
    //   });
    // }

    // if (getCommentListDto.keyword) {
    //   queryBuilder.andWhere(
    //     '(Comment.display_name LIKE :keyword OR Class.display_name LIKE :keyword OR Subject.display_name LIKE :keyword)',
    //     { keyword: `%${getCommentListDto.keyword}%` },
    //   );
    // }

    // if (getCommentListDto.subjects?.length) {
    //   queryBuilder.andWhere('Subject.id IN (:...subjects)', {
    //     subjects: getCommentListDto.subjects,
    //   });
    // }

    // return paginateByQuery(queryBuilder, paginationOptions, filter, {
    //   relations: {
    //     class: true,
    //   },
    // });
  }
}
