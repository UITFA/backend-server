import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Class } from '../../class/entities/class.entity';
import { Faculty } from '../../faculty/entities/faculty.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gender } from 'src/common/constants/gender';

@ObjectType()
@Entity()
export class Lecturer {
  @PrimaryGeneratedColumn()
  @Field()
  lecturer_id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  display_name: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  mscb?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  faculty_id?: string;

  @ManyToOne(() => Faculty, (faculty) => faculty.lecturers)
  @JoinColumn({ name: 'faculty_id' })
  // @Field(() => Faculty, { nullable: true })
  faculty?: Faculty;

  @Column({ nullable: true })
  @Field({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  learning_position?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  birth_date?: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  gender?: Gender;

  @Column({ nullable: true })
  @Field({ nullable: true })
  learning?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  email: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  ngach?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  position?: string;

  @OneToMany(() => Class, (class_) => class_.lecturer)
  // @Field(() => [Class], { nullable: true })
  classes?: Class[];

  @Column('float', { nullable: true })
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  total_point?: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  point_count?: number;
}
