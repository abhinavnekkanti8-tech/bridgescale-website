import { Global, Module } from '@nestjs/common';
import { RecordAccessService } from './services/record-access.service';

@Global()
@Module({
  providers: [RecordAccessService],
  exports: [RecordAccessService],
})
export class AccessControlModule {}
