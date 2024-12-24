import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FileDto {
  encoding: string;

  filename: string;

  mimetype: string;

  originalname: string;

  size: number;

  path: string;

  buffer: Buffer;

  constructor(
    path?: string,
    encoding?: string,
    filename?: string,
    mimetype?: string,
    originalname?: string,
    size?: number,
    buffer?: Buffer,
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
