import { Module, Global } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiWorkflowService } from './ai-workflow.service';
import { CrossVerifyService } from './cross-verify.service';
import { TalentPreScreenModule } from '../talent-pre-screen/talent-pre-screen.module';
import { OpportunityBriefsModule } from '../opportunity-briefs/opportunity-briefs.module';

@Global()
@Module({
  imports: [TalentPreScreenModule, OpportunityBriefsModule],
  providers: [AiService, AiWorkflowService, CrossVerifyService],
  exports: [AiService, AiWorkflowService, CrossVerifyService],
})
export class AiModule {}
