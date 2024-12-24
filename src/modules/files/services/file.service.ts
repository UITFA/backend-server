import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';

import { regexSemester } from 'src/common/constants/import-file-config';
import { CommentService } from 'src/modules/comment/comment.service';
import { CommentDto } from 'src/modules/comment/dto/Comment.dto';
import { SemesterRequestDto } from 'src/modules/semester/dto/Semester.request.dto';
import { SemesterService } from 'src/modules/semester/semester.service';
import { S3Service } from 'src/shared/services/s3Service.service';
import { PublicImageDto } from '../dtos/responses/CustomFile.dto';
import { FileDto } from '../dtos/responses/File.dto';
import { FileRepository } from '../repositories/file.repository';

@Injectable()
export class FileService {
  public logger: Logger;

  constructor(
    private readonly semesterService: SemesterService,
    private readonly commentService: CommentService,
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

  async uploadAndProcessFile(
    file: Express.Multer.File,
    targetFolder: string,
  ): Promise<void> {
    const fileDto = new FileDto(
      file.path,
      file.encoding,
      file.filename,
      file.mimetype,
      file.originalname,
      file.size,
      file.buffer,
    );
    const fileKey = await this.awsS3Service.uploadFile(fileDto, targetFolder);

    const uploadedFile = await this.fileRepository.createFile(
      new FileDto(fileKey, file.mimetype, file.originalname),
    );

    this.logger.log(`File uploaded: ${uploadedFile.key}`);

    const fileBuffer = await this.awsS3Service.downloadFile(fileKey);
    await this.processImportFile(fileBuffer, uploadedFile.originalName);
  }

  private async processImportFile(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<void> {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: null,
      });

      if (rawData.length === 0) {
        throw new BadRequestException('No data in file');
      }

      const isValid = this.validateFile(rawData);
      if (!isValid) {
        throw new BadRequestException('Invalid file');
      }

      await this.processFile(rawData);
    } catch (error) {
      this.logger.error(`Error when hadling ${fileName}: ${error.message}`);
      throw new BadRequestException('Error when handle file');
    }
  }

  private validateFile(dataFile: any[]): boolean {
    if (!Array.isArray(dataFile) || dataFile.length === 0) {
      this.logger.error('Data file is empty or not an array');
      return false;
    }

    const firstRow = dataFile[0];
    const firstColumnKey = Object.keys(firstRow)[0];
    const cleanedKey = firstColumnKey.replace(/[–—]/g, '-');

    if (
      typeof cleanedKey === 'string' &&
      regexSemester.test(cleanedKey.trim())
    ) {
      return true;
    } else {
      this.logger.error(
        `First row name does not match regex: ${firstColumnKey}`,
      );
      return false;
    }
  }

  private async processFile(dataFile: any[]): Promise<void> {
    const firstRow = dataFile[0];
    const firstColumn = Object.keys(firstRow)[0] as string;
    const match = regexSemester.exec(firstColumn);
    console.log('www', firstRow);
    console.log('bbb', firstColumn);
    console.log('ccc', match);

    if (!match) {
      throw new BadRequestException('Invalid first row');
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
      const content = Object.values(row)[0] as string;
      console.log('Content:', content);
      return new CommentDto(content);
    });

    await this.commentService.createCommentsForSemester(semester.id, comments);
  }
}
