import { Controller, Get, Param, Query } from '@nestjs/common';
import { CommentService } from '../comment.service';
import { GetCommentsDto } from '../dto/request/GetAllCommentDto';
import { GetCommentListDto } from '../dto/request/GetCommentListDto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async findAll(@Query() query: GetCommentListDto) {
    return this.commentService.findCommentList(query);
  }

  @Get('quantities')
  async getQuantity(@Query() query: GetCommentsDto) {
    const filter = query.filter ? JSON.parse(query.filter) : {};
    return this.commentService.getQuantity(filter, query.sentiment);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }
}
