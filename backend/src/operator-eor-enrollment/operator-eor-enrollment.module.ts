import { Module } from '@nestjs/common';
import { OperatorEorEnrollmentController } from './operator-eor-enrollment.controller';
import { OperatorEorEnrollmentService } from './operator-eor-enrollment.service';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PartnersModule],
  controllers: [OperatorEorEnrollmentController],
  providers: [OperatorEorEnrollmentService],
  exports: [OperatorEorEnrollmentService],
})
export class OperatorEorEnrollmentModule {}
