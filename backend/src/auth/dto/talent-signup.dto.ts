import { IsBoolean, IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class TalentSignupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsBoolean()
  privacyAccepted: boolean;

  @IsBoolean()
  termsAccepted: boolean;

  @IsString()
  @MaxLength(32)
  noticeVersion: string;
}
