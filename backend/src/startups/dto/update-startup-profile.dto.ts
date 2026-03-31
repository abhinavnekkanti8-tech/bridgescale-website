import { PartialType } from '@nestjs/mapped-types';
import { CreateStartupProfileDto } from './create-startup-profile.dto';

export class UpdateStartupProfileDto extends PartialType(CreateStartupProfileDto) {}
