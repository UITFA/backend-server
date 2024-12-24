import path from 'node:path';
import { PassThrough, Readable } from 'node:stream';

import { S3 } from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios, { AxiosError, type AxiosResponse } from 'axios';
import mime from 'mime-types';

import { type IFile, IStream } from '../../interfaces';
import { ApiConfigService } from './api-config.service';
import { GeneratorService } from './generator.service';
import { FileDto } from 'src/modules/files/dtos/responses/File.dto';

@Injectable()
export class S3Service {
  private readonly s3: S3;
  private readonly logger = new Logger(S3Service.name);

  constructor(
    public configService: ApiConfigService,
    public generatorService: GeneratorService,
  ) {
    const awsS3Config = configService.awsS3Config;

    this.s3 = new S3({
      apiVersion: awsS3Config.bucketApiVersion,
      region: awsS3Config.bucketRegion,
      credentials: {
        accessKeyId: awsS3Config.accessKeyId,
        secretAccessKey: awsS3Config.secretAccessKeyId,
      },
    });
  }

  async uploadImage(file: FileDto, folderName: string): Promise<string> {
    const fileName = this.generatorService.fileName(
      <string>mime.extension(file.mimetype),
    );
    const key = `${folderName}/${fileName}`;

    try {
      await this.s3.putObject({
        Bucket: this.configService.awsS3Config.bucketName,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
        Key: key,
      });
    } catch (error) {
      this.logger.error(`Cannot upload image with error: ${error}`);

      throw new InternalServerErrorException(
        `Cannot upload image with error: ${error}`,
      );
    }

    return key;
  }

  getImageUrl(imageId: string | undefined): string {
    const imageUrl = `https://${this.configService.awsS3Config.bucketName}.s3.amazonaws.com/${imageId}`;

    return imageUrl;
  }

  async convertImageUrlToFile(url: string): Promise<FileDto | null> {
    try {
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
        String(response.headers['content-type']) || 'png|image/png|csv|xlsx';
      const originalname = path.basename(url);
      const size = buffer.length;

      const file: IFile = {
        encoding,
        buffer,
        fieldname,
        mimetype,
        originalname,
        size,
      };
    } catch (error) {
      this.logger.error('Error downloading image:', error);

      if (error instanceof AxiosError) {
        return null;
      }

      throw error;
    }
  }
}

export class ReadableConfig extends Readable {}
