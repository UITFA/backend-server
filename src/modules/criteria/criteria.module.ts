import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SemesterModule } from '../semester/semester.module';
import { CriteriaService } from './criteria.service';
import { Criteria } from './entities/criteria.entity';
import { ClassModule } from '../class/class.module';
import { CriteriaResolver } from './controllers/criteria.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Criteria]),
    ClassModule,
    forwardRef(() => SemesterModule),
  ],
  providers: [CriteriaResolver, CriteriaService],
  exports: [CriteriaService],
})
export class CriteriaModule {}
