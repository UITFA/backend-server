import { Field, ObjectType } from '@nestjs/graphql';
import { Class } from '../../class/entities/class.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Semester } from 'src/modules/semester/entities/semester.entity';

@ObjectType()
@Entity({ name: 'comment' })
export class Comment {
  @PrimaryGeneratedColumn()
  @Field(() => String)
  comment_id: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  @Field(() => Class, { nullable: true })
  class: Class;

  @Column({ nullable: true })
  class_id: string;

  @Column({ name: 'content', nullable: true })
  @Field({ nullable: true })
  display_name: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  aspect: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  sentiment: string;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @Column({ nullable: true })
  semester_id: string;
}
