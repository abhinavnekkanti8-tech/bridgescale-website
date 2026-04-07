import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { SowTemplatesController } from './sow-templates.controller';
import { SowTemplatesService } from './sow-templates.service';

@Module({
  controllers: [ContractsController, SowTemplatesController],
  providers: [ContractsService, SowTemplatesService],
  exports: [ContractsService, SowTemplatesService],
})
export class ContractsModule {}
