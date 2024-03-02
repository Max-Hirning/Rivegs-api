import {SignInDto} from './sign-in.dto';
import {PickType} from '@nestjs/mapped-types';
import {IsJWT, IsNotEmpty, IsString} from 'class-validator';

export class ResetPasswordDto extends PickType(SignInDto, ['password']) {
  @IsJWT()
  @IsString()
  @IsNotEmpty()
    code: string;
}
