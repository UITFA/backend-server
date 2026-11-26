import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../services/file.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { join } from 'path';
import { writeFileSync } from 'fs';

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @InjectQueue('file-queue') private fileQueue: Queue,
  ) {}

  @Post('comments')
  @UseInterceptors(FileInterceptor('file'))
  async importComment(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
    try {
      const filePath = join(__dirname, '../../../uploads', file.originalname);
      writeFileSync(filePath, file.buffer);

      console.log(`File saved at: ${filePath}`);

      await this.fileQueue.add('import-lecturers', {
        filePath, 
        filename: file.originalname,
        mimetype: file.mimetype,
      });

      return { message: 'File processing started in background.' };

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('lecturers')
  @UseInterceptors(FileInterceptor('file'))
  async importLecturer(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.fileQueue.add('import-lecturers', {
        file,
        filename: file.originalname,
      });

      return { message: 'File processing started in background.' };

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('points')
  @UseInterceptors(FileInterceptor('file'))
  async importPoint(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.fileQueue.add('import-points', {
        file,
        filename: file.originalname,
      });

      return { message: 'File processing started in background.' };

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
