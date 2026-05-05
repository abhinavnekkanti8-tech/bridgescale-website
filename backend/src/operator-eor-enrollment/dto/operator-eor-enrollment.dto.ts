import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EorEnrollmentStatus, EorPartner } from '@prisma/client';

export class RequestEorEnrollmentDto {
  @IsEnum(EorPartner)
  partner: EorPartner;
}

export class UpdateEorEnrollmentStatusDto {
  @IsEnum(EorEnrollmentStatus)
  status: EorEnrollmentStatus;

  @IsOptional()
  @IsString()
  partnerSideId?: string;
}
