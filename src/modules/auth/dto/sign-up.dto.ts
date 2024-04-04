import {SignInDto} from './sign-in.dto';
import {IsNotEmpty, IsString, MaxLength} from 'class-validator';

export class SignUpDto extends SignInDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
    login: string;
}
