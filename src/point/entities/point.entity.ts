import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Class } from 'src/class/entities/class.entity';
import { Criteria } from 'src/criteria/entities/criteria.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Point {
  @PrimaryColumn()
  @Field(() => String)
  point_id: string;

  @Column()
  @Field(() => Int)
  max_point: number;

  @Column()
  @Field(() => Int)
  point: number;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  @Field(() => Class, { nullable: true })
  class: Class;

  @ManyToOne(() => Criteria)
  @JoinColumn({ name: 'criteria_id' })
  @Field(() => Criteria, { nullable: true })
  criteria: Criteria;

  @Column()
  @Field()
  criteria_id: string;
}
