import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class JobsService {
  constructor(@InjectQueue('importQueue') private importQueue: Queue) {}

  async addImportJob(semesterId: string, dataFile: any[]): Promise<void> {
    await this.importQueue.add('importTask', {
      semesterId,
      dataFile,
    });
  }
}
