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
import { BullAdapter } from 'bull-board/bullAdapter';
import { getQueueToken } from '@nestjs/bull';


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

  const serverAdapter = new ExpressAdapter();
  // serverAdapter.setBaseViewsDir .setBasePath('/admin/queues'); 

  // const { setQueues } = createBullBoard({
  //   queues: [], 
  //   serverAdapter, 
  // });

  // setQueues([new BullAdapter(importQueue)]);

  // app.use('/admin/queues', serverAdapter.getRouter());
  
  await app.listen(port);

  console.info(`server running on ${await app.getUrl()}`);

  return app;
}

void bootstrap();
