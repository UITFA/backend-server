import { PassThrough, Readable } from 'node:stream';
import * as path from 'path';

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios, { AxiosError, type AxiosResponse } from 'axios';

import { FileDto } from 'src/modules/files/dtos/responses/File.dto';
import { IStream } from '../../interfaces';
import { ApiConfigService } from './api-config.service';
import { GeneratorService } from './generator.service';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor(
    public configService: ApiConfigService,
    public generatorService: GeneratorService,
  ) {
    const awsS3Config = configService.awsS3Config;

    this.s3Client = new S3Client({
      apiVersion: awsS3Config.bucketApiVersion,
      region: awsS3Config.bucketRegion,
      credentials: {
        accessKeyId: awsS3Config.accessKeyId,
        secretAccessKey: awsS3Config.secretAccessKeyId,
      },
    });
  }

  getImageUrl(imageId: string | undefined): string {
    const imageUrl = `https://${this.configService.awsS3Config.bucketName}.s3.amazonaws.com/${imageId}`;

    return imageUrl;
  }

  async convertImageUrlToFile(url: string): Promise<FileDto | null> {
    try {
      if (!url) {
        throw new Error('URL is required');
      }
      const decodedUrl = decodeURIComponent(url);

      const parsedUrl = new URL(decodedUrl);

      const originalname = parsedUrl.pathname
        ? path.basename(parsedUrl.pathname)
        : 'unknown';

      const response: AxiosResponse<IStream, IStream> = await axios.get(url, {
        responseType: 'stream',
      });

      const passThrough = new PassThrough();
      response.data.pipe(passThrough);

      const chunks: Buffer[] = [];
      passThrough.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      await new Promise<void>(
        (resolve: (value: void | PromiseLike<void>) => void) =>
          passThrough.on('end', resolve),
      );

      const buffer = Buffer.concat(chunks);
      const encoding = 'binary';
      const fieldname = 'file';
      const mimetype =
        String(response.headers['content-type']) || 'application/octet-stream';
      const size = buffer.length;

      const file: FileDto = {
        encoding,
        filename: fieldname,
        mimetype,
        originalname,
        size,
        path: path.resolve(originalname).toString(),
        buffer,
      };
      return file;
    } catch (error) {
      this.logger.error('Error downloading image:', error);

      if (error instanceof AxiosError) {
        return null;
      }

      throw error;
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      });

      const data = await this.s3Client.send(command);

      if (!data.Body) {
        throw new BadRequestException('File not found in S3');
      }

      const buffer = await streamToBuffer(data.Body);

      return buffer;
    } catch (error) {
      throw new BadRequestException(`Error when downloading file from S3: ${error.message}`);
    }
  }

  async uploadFile(file: FileDto, targetFolder: string): Promise<string> {
    const key = `${targetFolder}/${file.filename}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return key;
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error.message}`);
      throw new InternalServerErrorException('Error uploading file to S3');
    }
  }
}
 
const streamToBuffer = (stream: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

export class ReadableConfig extends Readable {}
