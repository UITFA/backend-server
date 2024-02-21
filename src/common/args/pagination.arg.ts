import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int)
  page: number = 0;

  @Field(() => Int)
  size: number = 10;
}
