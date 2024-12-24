import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'files' })
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column()
  @Field(() => String)
  key!: string;

  @Column({ name: 'file_name' })
  @Field(() => String)
  fileName: string;

  @Column({ name: 'mime_type' })
  @Field(() => String)
  mimeType: string;

  @Column({ name: 'original_name' })
  @Field(() => String)
  originalName: string;

  @Column({ name: 'size' })
  @Field(() => Int)
  size: number;
}
