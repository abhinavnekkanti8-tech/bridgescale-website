import { Module } from '@nestjs/common';
import { TalentPreScreenController } from './talent-pre-screen.controller';
import { TalentPreScreenService } from './talent-pre-screen.service';

@Module({
  controllers: [TalentPreScreenController],
  providers: [TalentPreScreenService],
  exports: [TalentPreScreenService],
})
export class TalentPreScreenModule {}
