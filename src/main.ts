/* eslint-disable unicorn/prefer-top-level-await */

import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  type NestExpressApplication,
} from '@nestjs/platform-express';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { SharedModule } from 'src/shared/shared.module';
import { AppModule } from './app.module';
import { createBullBoard } from 'bull-board';
import { ExpressAdapter as BullExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from 'bull-board/bullMQAdapter';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bullmq';

export async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );
  app.enableVersioning();

  const configService = app.select(SharedModule).get(ApiConfigService);

  if (!configService.isDevelopment) {
    app.enableShutdownHooks();
  }

  const port = configService.appConfig.port;

  const serverAdapter = new BullExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const fileQueue = app.get<Queue>(getQueueToken('file-queue'));

  const { router, setQueues } = createBullBoard([new BullMQAdapter(fileQueue)]);

  app.use('/admin/queues', router);

  await app.listen(port);

  console.info(`server running on ${await app.getUrl()}`);
  console.info(`Bull Board running on ${await app.getUrl()}/admin/queues`);


  return app;
}

void bootstrap();
