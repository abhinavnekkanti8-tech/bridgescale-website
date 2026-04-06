import { Module } from '@nestjs/common';
import { ApplicationMatchingController } from './application-matching.controller';
import { ApplicationMatchingService } from './application-matching.service';

@Module({
  controllers: [ApplicationMatchingController],
  providers: [ApplicationMatchingService],
  exports: [ApplicationMatchingService],
})
export class ApplicationMatchingModule {}
