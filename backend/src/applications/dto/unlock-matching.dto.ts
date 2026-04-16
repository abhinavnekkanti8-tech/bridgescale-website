import { IsString } from 'class-validator';

export class UnlockMatchingRazorpayDto {
  @IsString()
  applicationId: string;

  @IsString()
  razorpayOrderId: string;

  @IsString()
  razorpayPaymentId: string;

  @IsString()
  razorpaySignature: string;
}

export class UnlockMatchingStripeDto {
  @IsString()
  applicationId: string;
}
