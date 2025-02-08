import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../services/file.service';

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
  ) {}

  @Post('comments')
  @UseInterceptors(FileInterceptor('file'))
  async importComment(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.fileService.importAndPredict(file);
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
      return await this.fileService.importLecturer(file);
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
      return await this.fileService.importPoint(file);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
