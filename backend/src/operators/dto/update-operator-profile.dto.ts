import { PartialType } from '@nestjs/mapped-types';
import { CreateOperatorProfileDto } from './create-operator-profile.dto';

export class UpdateOperatorProfileDto extends PartialType(CreateOperatorProfileDto) {}
