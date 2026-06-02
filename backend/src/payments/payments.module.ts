import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RazorpayService } from './razorpay.service';
import { PayoutProviderService } from './payout-provider.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, RazorpayService, PayoutProviderService],
  exports: [PaymentsService, RazorpayService, PayoutProviderService],
})
export class PaymentsModule {}
