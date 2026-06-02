import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  redirect?: string;
}
