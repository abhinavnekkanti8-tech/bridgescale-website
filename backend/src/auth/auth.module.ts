import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { ApplicationsModule } from '../applications/applications.module';
import { AccountSecurityModule } from '../account-security/account-security.module';

@Module({
  imports: [UsersModule, ApplicationsModule, AccountSecurityModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
