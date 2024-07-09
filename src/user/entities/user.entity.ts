import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enums/role.enum';

@ObjectType()
@Entity()
export class UserEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Role)
  @Column({ type: 'enum', enum: Object.values(Role) })
  role: string;

  @Field(() => String)
  @Column({ default: '', nullable: true })
  displayName: string;

  @Field(() => String)
  @Column()
  username: string;

  @Field(() => String)
  @Column()
  password: string;
}
