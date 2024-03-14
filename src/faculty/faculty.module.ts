import { Module, forwardRef } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { FacultyResolver } from './faculty.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { LecturerModule } from 'src/lecturer/lecturer.module';
import { SubjectModule } from 'src/subject/subject.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Faculty]),
    forwardRef(() => LecturerModule),
    forwardRef(() => SubjectModule),
  ],
  providers: [FacultyResolver, FacultyService],
  exports: [TypeOrmModule.forFeature([Faculty]), FacultyService],
})
export class FacultyModule {}
