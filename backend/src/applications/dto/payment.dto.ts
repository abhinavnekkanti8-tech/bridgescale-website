import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyRazorpayDto {
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;
}

export class DummyConfirmDto {
  @IsString()
  @IsNotEmpty()
  applicationId: string;
}
