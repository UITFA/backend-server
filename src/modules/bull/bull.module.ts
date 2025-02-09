import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './bull.service';
import { ImportProcessor } from './bull.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'importQueue',
    }),
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
  ],
  providers: [JobsService, ImportProcessor  ],
})
export class JobsModule {}
