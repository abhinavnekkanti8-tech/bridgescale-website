import { Module, Global } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiWorkflowService } from './ai-workflow.service';
import { CrossVerifyService } from './cross-verify.service';

@Global()
@Module({
  providers: [AiService, AiWorkflowService, CrossVerifyService],
  exports: [AiService, AiWorkflowService, CrossVerifyService],
})
export class AiModule {}
