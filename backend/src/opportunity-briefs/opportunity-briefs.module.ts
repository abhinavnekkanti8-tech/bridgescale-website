import { Module } from '@nestjs/common';
import { OpportunityBriefsController } from './opportunity-briefs.controller';
import { OpportunityBriefsService } from './opportunity-briefs.service';

@Module({
  controllers: [OpportunityBriefsController],
  providers: [OpportunityBriefsService],
  exports: [OpportunityBriefsService],
})
export class OpportunityBriefsModule {}
