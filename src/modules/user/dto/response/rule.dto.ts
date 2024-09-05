import { IsEnum, IsObject } from 'class-validator';

import { RuleType } from '../../enums/rule.type';
import { IRuleData, RuleEntity } from 'src/shared/entities/rule.entity';

export class RuleDto {
  @IsEnum(() => RuleType)
  ruleName: RuleType;

  @IsObject()
  ruleData: IRuleData[];

  constructor(rule: RuleEntity) {
    this.ruleName = rule.ruleName;
    this.ruleData = rule.ruleData;
  }
}
