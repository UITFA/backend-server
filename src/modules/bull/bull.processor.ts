import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('importQueue')
export class ImportProcessor {
  @Process('file-import-job') 
  async handleFileImport(job: Job) {
    const { file } = job.data;

    console.log(`Processing file import: ${file.originalname}`);

    try {
      // Logic xử lý file
      console.log(`File ${file.originalname} is being processed`);

      // Ví dụ: Giả lập việc xử lý file
      await new Promise((resolve) => setTimeout(resolve, 5000));

      console.log(`File ${file.originalname} processing completed`);
      return {
        success: true,
        message: `File ${file.originalname} processed successfully`,
      };
    } catch (error) {
      console.error(`Error processing file ${file.originalname}`, error);
      throw error;
    }
  }
}
