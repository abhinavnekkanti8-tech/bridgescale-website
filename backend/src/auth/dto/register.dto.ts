import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';

export enum RegisterRole {
  STARTUP_ADMIN = 'STARTUP_ADMIN',
  OPERATOR = 'OPERATOR',
}

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters.' })
  @MaxLength(100)
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  @MaxLength(128)
  password: string;

  @IsEnum(RegisterRole, { message: 'Role must be STARTUP_ADMIN or OPERATOR.' })
  role: RegisterRole;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  orgName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  linkedIn?: string;
}
