import { Field, ObjectType } from '@nestjs/graphql';
import { Class } from '../../class/entities/class.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Semester } from 'src/modules/semester/entities/semester.entity';

@ObjectType()
@Entity({ name: 'comment' })
export class Comment {
  @PrimaryColumn()
  @Field(() => String)
  comment_id: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  @Field(() => Class, { nullable: true })
  class: Class;

  @Column({ name: 'content' })
  @Field()
  display_name: string;

  @Column()
  @Field(() => String)
  type: string;

  @Column({ nullable: true })
  @Field(() => String)
  aspect: string;

  @Column({ nullable: true })
  @Field(() => String)
  sentiment: string;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @Column({ nullable: true })
  semester_id: string;
}
