import { Module } from '@nestjs/common';
import { OperatorTaxProfileController } from './operator-tax-profile.controller';
import { OperatorTaxProfileService } from './operator-tax-profile.service';

@Module({
  controllers: [OperatorTaxProfileController],
  providers: [OperatorTaxProfileService],
  exports: [OperatorTaxProfileService],
})
export class OperatorTaxProfileModule {}

