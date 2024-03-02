import {OmitType, PartialType} from '@nestjs/mapped-types';
import {SignUpDto} from '../../../modules/auth/dto/sign-up.dto';
import {MaxLength, IsNotEmpty, IsString, IsOptional} from 'class-validator';

export class UpdateProfileDto extends PartialType(OmitType(SignUpDto, ['password'])) {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(500)
    description: string;
}
