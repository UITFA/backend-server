import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResolver } from './controllers/comment.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentController } from './controllers/comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentResolver, CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
