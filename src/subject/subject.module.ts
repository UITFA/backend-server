import { Module, forwardRef } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectResolver } from './subject.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { PointModule } from 'src/point/point.module';
import { FacultyModule } from 'src/faculty/faculty.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject]),
    PointModule,
    forwardRef(() => FacultyModule),
  ],
  providers: [SubjectResolver, SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
