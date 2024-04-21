import {SignInDto} from './sign-in.dto';
import {IsNotEmpty, IsString, Length} from 'class-validator';

export class ResetPasswordDto extends SignInDto {
  @Length(8)
  @IsString()
  @IsNotEmpty()
    code: string;
}