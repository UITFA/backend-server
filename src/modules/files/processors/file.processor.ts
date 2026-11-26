import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bullmq';
import { FileService } from '../services/file.service';

@Processor('file-queue')
export class FileProcessor {
  constructor(private readonly fileService: FileService) {}

  @Process('import-comments')
  async handleImportComments(job: Job) {
    console.log(`Processing comment file: ${job.data.filename}`);
    const result = await this.fileService.importAndPredict(job.data.file);
    console.log(
      `Processing comment file: ${job.data.filename} has been completed`,
    );
    return result;
  }

  @Process('import-lecturers')
  async handleImportLecturers(job: Job) {
    console.log(`Processing lecturer file: ${job.data.filename}`);
    const result = await this.fileService.importLecturer(job.data.file);
    console.log(
      `Processing lecturer file: ${job.data.filename} has been completed`,
    );
    return result;
  }

  @Process('import-points')
  async handleImportPoints(job: Job) {
    console.log(`Processing points file: ${job.data.filename}`);
    const result = await this.fileService.importPoint(job.data.file);
    console.log(
      `Processing point file: ${job.data.filename} has been completed`,
    );
    return result;
  }
}
