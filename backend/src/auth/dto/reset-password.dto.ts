import { IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/strong-password.decorator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(20)
  token: string;

  @IsStrongPassword()
  password: string;
}
