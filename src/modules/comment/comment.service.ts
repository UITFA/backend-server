import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterArgs } from 'src/common/args/filter.arg';
import { PaginationArgs } from 'src/common/args/pagination.arg';
import { filterQuery } from 'src/common/utils/filterQuery';
import { paginateByQuery } from 'src/common/utils/paginate';
import { Repository, UpdateResult } from 'typeorm';
import { InitCommentRequestDto } from './dto/InitComment.request.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(@InjectRepository(Comment) private repo: Repository<Comment>) {}

  findAll(filter: FilterArgs, paginationOptions: PaginationArgs, type: string) {
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
      ).andWhere(type && type != 'all' ? 'Comment.type = :type' : 'true', {
        type,
      }),
      paginationOptions,
      filter,
      {
        relations: {
          class: true,
        },
      },
    );
  }

  async getQuantity(filter: FilterArgs, type: string) {
    return {
      type: type ?? 'all',
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
          .andWhere(type && type != 'all' ? 'Comment.type = :type' : 'true', {
            type,
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
      content: commentDto.content,
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
}
