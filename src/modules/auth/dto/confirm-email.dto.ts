import {SignInDto} from './sign-in.dto';
import {PickType} from '@nestjs/mapped-types';
import {IsString, IsNotEmpty, Length} from 'class-validator';

export class ConfirmEmailDto extends PickType(SignInDto, ['email']) {
  @Length(4)
  @IsString()
  @IsNotEmpty()
    code: string;
}