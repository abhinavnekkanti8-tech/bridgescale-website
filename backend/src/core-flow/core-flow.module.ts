import { Module } from '@nestjs/common';
import { CoreFlowController } from './core-flow.controller';
import { CoreFlowService } from './core-flow.service';

@Module({
  controllers: [CoreFlowController],
  providers: [CoreFlowService],
  exports: [CoreFlowService],
})
export class CoreFlowModule {}

