import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GeneratorService } from 'src/shared/services/generator.service';
import { S3Service } from 'src/shared/services/s3Service.service';
import { SharedModule } from '../../shared/shared.module';
import { CommentModule } from '../comment/comment.module';
import { SemesterModule } from '../semester/semester.module';
import { FileController } from './controllers/file.controler';
import { FileResolver } from './controllers/file.resolver';
import { FileEntity } from './entities/fileS3.entity';
import { FileRepository } from './repositories/file.repository';
import { FileService } from './services/file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    SharedModule,
    forwardRef(() => SemesterModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [FileController],
  exports: [],
  providers: [
    FileResolver,
    FileService,
    S3Service,
    FileRepository,
    GeneratorService,
  ],
})
export class FileModule {}
