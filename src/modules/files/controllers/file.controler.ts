import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../services/file.service';
import { destinationFolders } from 'src/common/constants/destination-folders';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
    const targetFolder: string = destinationFolders.import;
    try {
      const result = await this.fileService.uploadAndProcessFile(
        file,
        targetFolder,
      );
      return {
        message: 'File imported successfully',
        result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
