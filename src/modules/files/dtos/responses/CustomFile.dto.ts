import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileDto {
  @ApiProperty({ example: '87beef48-c385-434d-a50c-a0a73f41a8f8' })
  id!: string;
}

export class PublicImageDto {
  @ApiProperty({
    example: 'https://alia-pro-staging.s3.amazonaws.com/contents%2F0cc89a70-428d-11ef-8053-6bdba52dbe98.png',
  })
  url!: string;
}

export class FileInfoDto{
  filename: string;

  mimetype: string;

  originalname: string;

  size: number;

  path: string;
}
