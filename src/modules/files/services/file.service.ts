import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { IFile } from '../../../interfaces';
import { FileRepository } from '../repositories/file.repository';
import { S3Service } from 'src/shared/services/s3Service.service';
import {
  PublicImageDto,
  UploadedFileDto,
} from '../dtos/responses/CustomFile.dto';
import {
  ImportFileConfig,
  regexSemester,
} from 'src/common/constants/import-file-config';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as excelToJson from 'convert-excel-to-json';
import { FileDto } from '../dtos/responses/File.dto';
import { SemesterService } from 'src/modules/semester/semester.service';
import { SemesterRequestDto } from 'src/modules/semester/dto/Semester.request.dto';
import { CommentService } from 'src/modules/comment/comment.service';
import { CommentDto } from 'src/modules/comment/dto/Comment.dto';
import { FileRequestDto } from '../dtos/request/File.request.dto';

@Injectable()
export class FileService {
  public logger: Logger;
  private readonly s3Service: S3Service;
  private readonly semesterService: SemesterService;
  private readonly commentService: CommentService;

  constructor(
    private readonly awsS3Service: S3Service,
    private readonly fileRepository: FileRepository,
  ) {
    this.logger = new Logger(FileService.name);
  }

  async getImageById(id: string): Promise<PublicImageDto> {
    try {
      const fileEntity = await this.fileRepository.findImageById(id);

      if (!fileEntity) {
        throw new NotFoundException(`Cannot found image with id: ${id}`);
      }

      const imageUrl = this.awsS3Service.getImageUrl(fileEntity.key);

      const uploadedImageResponse: PublicImageDto = {
        url: imageUrl,
      };

      return uploadedImageResponse;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  private async uploadImageFile(
    file: FileDto,
    targetFolder: string,
  ): Promise<UploadedFileDto> {
    const imageKey = await this.awsS3Service.uploadImage(file, targetFolder);
    const imageId = encodeURIComponent(imageKey);

    const insertedImage = await this.fileRepository.createFile(
      new FileDto(imageId),
    );

    const uploadedFileDto: UploadedFileDto = {
      id: insertedImage.id,
    };

    return uploadedFileDto;
  }

  async importFile(file: FileRequestDto, targetFolder: string) {
    const buffer = Buffer.from(file.buffer, 'base64');
    const fileDto = new FileDto(
      file.path,
      file.encoding,
      file.filename,
      file.mimetype,
      file.originalname,
      file.size,
      buffer,
    );
    const fileUpload: UploadedFileDto = await this.uploadImageFile(
      fileDto,
      targetFolder,
    );

    const publicFileUrl = await this.getImageById(fileUpload?.id);

    const fileInfo = await this.s3Service.convertImageUrlToFile(
      publicFileUrl.url,
    );

    return this.importCommentsFromFile(fileInfo);
  }

  private async importCommentsFromFile(file: FileDto) {
    return this.getCommentsFromFileForImport(file);
  }

  private async getCommentsFromFileForImport(file: FileDto) {
    const listCommentRawData = await this.convertXlsxToListCommentEntity(file);

    fs.unlinkSync(file.path);

    if (listCommentRawData.length === 0) {
      throw new BadRequestException('No data in file');
    }
  }

  private async convertXlsxToListCommentEntity(file: FileDto) {
    let filePath: string;
    try {
      filePath = file.path;
    } catch {
      throw new BadRequestException('Could not file in form-data');
    }
    let dataFile = null,
      dataJson = null;
    try {
      dataFile = excelToJson({
        sourceFile: filePath,
        header: {
          rows: ImportFileConfig.HEADER_ROW,
        },
      });
      for (const key of Object.keys(dataFile)) {
        dataFile = dataFile[key];
        break;
      }
    } catch {
      throw new BadRequestException('This is not a excel file');
    }

    if (this.validateFile(dataFile) === false) {
      throw new BadRequestException('Not right format');
    }
    try {
      dataJson = excelToJson({
        sourceFile: filePath,
        includeEmptyLines: true,
        header: {
          rows: ImportFileConfig.HEADER_ROW,
        },
      });

      const result = dataJson[Object.keys(dataJson)[0]].slice(
        ImportFileConfig.HEADER_ROW,
      );
      const formatted = [];
      for (const item of result) {
        formatted.push({});
      }
      return formatted;
    } catch {
      throw new BadRequestException('Not right format');
    }
  }

  private validateFile(dataFile) {
    let isTemplateFile = true;

    if (dataFile.length === 0) {
      isTemplateFile = false;
    } else {
      for (const row of dataFile) {
        const firstColumn = Object.values(row)[0];
        if (
          typeof firstColumn !== 'string' ||
          !regexSemester.test(firstColumn)
        ) {
          return false;
        }
      }
      return true;
    }
    return isTemplateFile;
  }

  async processFile(dataFile: any[]): Promise<void> {
    if (dataFile.length < 1) {
      throw new Error('No data in file');
    }

    const firstRow = dataFile[0];
    const firstColumn = Object.values(firstRow)[0] as string;
    const match = regexSemester.exec(firstColumn);

    if (!match) {
      throw new Error(
        'Invalid first row. Valid format is HK1 yyyy-yyyy or HK2 yyyy-yyyy.',
      );
    }

    const [_, type, year] = match;

    const semesterRequest = new SemesterRequestDto(type, year);

    let semester = await this.semesterService.findSemester(semesterRequest);

    if (!semester) {
      semester = await this.semesterService.createSemester(semesterRequest);
    } else {
      await this.commentService.deleteCommentsBySemesterId(semester.id);
    }

    const comments = dataFile.slice(1).map((row) => {
      const content = Object.values(row)[1] as string;
      return new CommentDto(content);
    });
    await this.commentService.createCommentsForSemester(semester.id, comments);
  }
}
