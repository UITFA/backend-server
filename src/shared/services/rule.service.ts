import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RuleDto } from 'src/modules/user/dto/response/rule.dto';
import { RuleEngineService } from 'src/shared/services/rule-engine.service';
import { Repository } from 'typeorm';
import { RuleEntity } from '../entities/rule.entity';

@Injectable()
export class RuleService {
  public logger: Logger;

  constructor(
    @InjectRepository(RuleEntity) private repo: Repository<RuleEntity>,

    public readonly ruleEngine: RuleEngineService,
  ) {
    this.logger = new Logger(RuleService.name);
  }

  public async findByName(ruleName): Promise<RuleDto> {
    try {
      const rule = await this.repo.findOne({
        where: {
          ruleName,
        },
      });

      if (!rule) {
        throw new NotFoundException(`Cannot found Rule with name: ${ruleName}`);
      }

      return new RuleDto(rule);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
