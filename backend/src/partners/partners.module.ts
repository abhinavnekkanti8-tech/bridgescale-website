import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { StripeConnectService } from './stripe-connect.service';
import { RazorpayPayoutService } from './razorpay-payout.service';
import { WiseService } from './wise.service';
import { DeelService } from './eor/deel.service';
import { RemoteService } from './eor/remote.service';
import { MultiplierService } from './eor/multiplier.service';

@Module({
  controllers: [PartnersController],
  providers: [
    StripeConnectService,
    RazorpayPayoutService,
    WiseService,
    DeelService,
    RemoteService,
    MultiplierService,
  ],
  exports: [
    StripeConnectService,
    RazorpayPayoutService,
    WiseService,
    DeelService,
    RemoteService,
    MultiplierService,
  ],
})
export class PartnersModule {}
