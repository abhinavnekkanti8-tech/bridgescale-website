import { Module } from '@nestjs/common';
import { AccountSecurityService } from './account-security.service';

@Module({
  providers: [AccountSecurityService],
  exports: [AccountSecurityService],
})
export class AccountSecurityModule {}
