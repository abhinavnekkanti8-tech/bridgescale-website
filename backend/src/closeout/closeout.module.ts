import { Module } from '@nestjs/common';
import { CloseoutController } from './closeout.controller';
import { CloseoutService } from './closeout.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [CloseoutController],
  providers: [CloseoutService],
  exports: [CloseoutService],
})
export class CloseoutModule {}
