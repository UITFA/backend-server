import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class PermissionEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column({ nullable: true })
  user_id: string;

  @Field(() => String)
  @Column({ nullable: true })
  lecture_id: string;

  @Field(() => String)
  @Column({ nullable: true })
  faculty_id: string;
}
