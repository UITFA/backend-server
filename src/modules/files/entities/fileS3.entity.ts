import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'files' })
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column({ nullable: true })
  @Field(() => String)
  key!: string;

  @Column({ name: 'file_name', nullable: true })
  @Field(() => String)
  fileName: string;

  @Column({ name: 'mime_type', nullable: true })
  @Field(() => String)
  mimeType: string;

  @Column({ name: 'original_name', nullable: true })
  @Field(() => String)
  originalName: string;

  @Column({ name: 'size', nullable: true })
  @Field(() => Int)
  size: number;
}
