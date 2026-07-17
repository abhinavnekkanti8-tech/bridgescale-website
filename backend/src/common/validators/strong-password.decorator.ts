import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Baseline password-strength policy, applied everywhere a password is set.
 *
 * Requires 10–128 characters with at least one lowercase letter, one uppercase
 * letter, and one digit. Keeping this in one decorator means signup, talent
 * signup, and password reset can never drift apart.
 */
export function IsStrongPassword(): PropertyDecorator {
  return applyDecorators(
    IsString(),
    MinLength(PASSWORD_MIN_LENGTH, {
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    }),
    MaxLength(PASSWORD_MAX_LENGTH),
    Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message:
        'Password must include an uppercase letter, a lowercase letter, and a number.',
    }),
  );
}
