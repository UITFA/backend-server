import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../../shared/shared.module';
import { FileRepository } from './repositories/file.repository';
import { FileService } from './services/file.service';
import { FileEntity } from './entities/fileS3.entity';
import { FileResolver } from './file.resolver';
import { SemesterModule } from '../semester/semester.module';
import { CommentModule } from '../comment/comment.module';
import { S3Service } from 'src/shared/services/s3Service.service';
import { GeneratorService } from 'src/shared/services/generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    SharedModule,
    forwardRef(() => SemesterModule),
    forwardRef(() => CommentModule),
  ],
  exports: [FileResolver],
  providers: [
    FileResolver,
    FileService,
    S3Service,
    FileRepository,
    GeneratorService,
  ],
})
export class FileModule {}
