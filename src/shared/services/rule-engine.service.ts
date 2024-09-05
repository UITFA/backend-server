import { Injectable } from '@nestjs/common';
import { Engine, EngineResult, Fact, Rule, RuleProperties } from 'json-rules-engine';

@Injectable()
export class RuleEngineService {
  public engine: Engine = new Engine();

  public importRules(rules: RuleProperties[]): Engine {
    for (const rule of rules) {
      this.engine.addRule(new Rule(rule));
    }

    return this.engine;
  }

  public addFact(inputFact: Fact): Engine {
    this.engine.addFact(inputFact);

    return this.engine;
  }

  public removeFact(factName: string): Engine {
    this.engine.removeFact(factName);

    return this.engine;
  }

  public removeRule(rule: string): Engine {
    const parsedRule: RuleProperties = JSON.parse(rule) as RuleProperties;
    this.engine.removeRule(new Rule(parsedRule));

    return this.engine;
  }

  public async run(): Promise<EngineResult> {
    try {
      const result: EngineResult = await this.engine.run();

      return result;
    } catch (error) {
      throw new Error(`Engine run failed: ${(error as Error).message}`);
    }
  }
}
