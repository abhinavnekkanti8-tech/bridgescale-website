import { IsBoolean, IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/strong-password.decorator';

export class TalentSignupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsBoolean()
  privacyAccepted: boolean;

  @IsBoolean()
  termsAccepted: boolean;

  @IsString()
  @MaxLength(32)
  noticeVersion: string;
}
