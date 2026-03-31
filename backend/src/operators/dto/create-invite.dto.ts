import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { MembershipRole } from '@prisma/client';

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsEnum(MembershipRole)
  role: MembershipRole;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  orgName?: string;
}
