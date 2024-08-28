import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from './decorator/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Faculty } from '../faculty/entities/faculty.entity';
import { Lecturer } from '../lecturer/entities/lecturer.entity';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserEntity], { name: 'users' })
  findAll(@Args('name', { nullable: true }) name?: string) {
    return this.userService.findAll(name);
  }

  @Mutation(() => UserEntity)
  registerUser(
    @Args('user')
    user: UserDto,
  ): Promise<UserEntity> {
    return this.userService.create(user);
  }

  @Mutation(() => UserEntity)
  updateUser(
    @Args('user')
    user: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.update(user.id, user);
  }

  @Mutation(() => Boolean)
  async removeUser(
    @Args('id')
    id: string,
  ): Promise<any> {
    await this.userService.remove(id);
    return true;
  }

  @Query(() => UserEntity)
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: UserEntity) {
    return user;
  }

  @ResolveField(() => Faculty, { nullable: true })
  faculty(@Parent() user: UserEntity) {
    return user.faculty;
  }

  @ResolveField(() => Lecturer, { nullable: true })
  lecturer(@Parent() user: UserEntity) {
    return user.lecturer;
  }
}
