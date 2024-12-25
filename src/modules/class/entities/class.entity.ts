import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Lecturer } from '../../../modules/lecturer/entities/lecturer.entity';
import { Point } from '../../../modules/point/entities/point.entity';
import { Semester } from '../../../modules/semester/entities/semester.entity';
import { Subject } from '../../../modules/subject/entities/subject.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'class' })
export class Class {
  @PrimaryGeneratedColumn()
  @Field(() => String)
  class_id: string;

  @Column({ nullable: true })
  @Field()
  display_name: string;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @Column({ nullable: true })
  semester_id: string;

  @Column({ nullable: true })
  @Field()
  program: string;

  @Column({ nullable: true })
  @Field()
  class_type: string;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ nullable: true })
  subject_id: string;

  @ManyToOne(() => Lecturer, (lecturer) => lecturer.classes)
  @JoinColumn({ name: 'lecturer_id' })
  lecturer: Lecturer;

  @Column({ nullable: true })
  lecturer_id: string;

  @Column({ nullable: true })
  @Field(() => Int)
  total_student: number;

  @Column({ nullable: true })
  @Field(() => Int)
  participating_student: number;

  @OneToMany(() => Point, (point) => point.class)
  points: Point[];
}
