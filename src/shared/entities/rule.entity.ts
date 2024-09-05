import { Field } from '@nestjs/graphql';
import { RuleType } from 'src/modules/user/enums/rule.type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface ICondition {
  fact: string;
  operator: string;
  value: string;
  path: string;
}

export interface IEvent {
  type: string;
  params: IParams;
}

export interface IRoleEvent {
  type: string;
  params: IRoleParams;
}

export interface IParams {
  type: string;
  strengths: string[];
}

export interface IRoleParams {
  role: string;
}

export interface IConditions {
  all: ICondition[];
}

export interface IRuleData {
  conditions: IConditions;
  event: IEvent;
}

@Entity({ name: 'rules' })
export class RuleEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({
    nullable: false,
    type: 'enum',
    enum: RuleType,
    default: RuleType.ROLE,
  })
  ruleName!: RuleType;

  @Field(() => String)
  @Column('jsonb', { nullable: true })
  ruleData!: IRuleData[];
}
