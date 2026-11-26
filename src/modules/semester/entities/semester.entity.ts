import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Semester {
  @PrimaryGeneratedColumn()
  @Field(() => String)
  semester_id: string;

  @Column({ nullable: true })
  @Field()
  display_name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  type: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  year: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  classType: string;
}
