import { Global, Module } from '@nestjs/common';

import { ApiConfigService } from './services/api-config.service';
import { RuleService } from './services/rule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuleEntity } from './entities/rule.entity';
import { RuleEngineService } from './services/rule-engine.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RuleEntity])],
  exports: [ApiConfigService, RuleService, RuleEngineService],
  providers: [ApiConfigService, RuleService, RuleEngineService],
})
export class SharedModule {}
