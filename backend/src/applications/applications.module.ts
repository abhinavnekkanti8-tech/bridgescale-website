import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { PaymentsModule } from '../payments/payments.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PaymentsModule, AiModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
