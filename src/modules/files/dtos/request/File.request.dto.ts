import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class FileRequestDto {
  @Field()
  encoding: string;

  @Field()
  filename: string;

  @Field()
  mimetype: string;

  @Field()
  originalname: string;

  @Field()
  size: number;

  @Field()
  path: string;

  @Field()
  buffer: string;

  constructor(
    path?: string,
    encoding?: string,
    filename?: string,
    mimetype?: string,
    originalname?: string,
    size?: number,
    buffer?: string,
  ) {
    this.encoding = encoding;
    this.filename = filename;
    this.mimetype = mimetype;
    this.originalname = originalname;
    this.size = size;
    this.path = path;
    this.buffer = buffer;
  }
}
