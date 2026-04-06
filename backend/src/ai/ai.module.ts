import { Module, Global } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiWorkflowService } from './ai-workflow.service';

@Global()
@Module({
  providers: [AiService, AiWorkflowService],
  exports: [AiService, AiWorkflowService],
})
export class AiModule {}
