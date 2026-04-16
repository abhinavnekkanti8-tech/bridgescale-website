import { IsArray, ArrayMinSize, ValidateNested, IsString, IsOptional, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

class ReferenceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  linkedIn?: string;
}

export class CompleteReferencesDto {
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 references are required.' })
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  references: ReferenceDto[];
}
