import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Lecturer } from '../../lecturer/entities/lecturer.entity';
import {
  GroupedPoint,
  PaginatedGroupedPoint,
} from '../../point/dto/PaginatedGroupedPoint';
import { Subject } from '../../subject/entities/subject.entity';

@ObjectType()
@Entity()
export class Faculty {
  @PrimaryGeneratedColumn()
  @Field(() => String)
  faculty_id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  display_name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  full_name: string;

  @Column({ default: true, nullable: true })
  @Field(() => Boolean, { nullable: true, defaultValue: true })
  is_displayed: boolean;

  @OneToMany(() => Lecturer, (lecturer) => lecturer.faculty)
  lecturers: Lecturer[];

  @OneToMany(() => Subject, (subject) => subject.faculty)
  subjects: Subject[];

  @Field(() => GroupedPoint, { nullable: true })
  total_point: GroupedPoint;

  @Field(() => PaginatedGroupedPoint, { nullable: true })
  points: PaginatedGroupedPoint;
}
