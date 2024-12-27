import { Module } from '@nestjs/common';
import { AsbaService } from './asba.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    SharedModule,
    HttpModule
  ],
  providers: [AsbaService],
  exports: [AsbaService],
})
export class ExternalModule {}
