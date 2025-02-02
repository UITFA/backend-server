import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Class } from '../../class/entities/class.entity';
import { Faculty } from '../../faculty/entities/faculty.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Subject {
  @Field()
  @PrimaryGeneratedColumn()
  subject_id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  display_name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  faculty_id: string;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'faculty_id' })
  faculty: Faculty;

  @Column({ type: 'float', nullable: true })
  @Field(() => Float, { nullable: true })
  total_point: number;

  @OneToMany(() => Class, (classItem) => classItem.subject)
  classes: Class[];
}
