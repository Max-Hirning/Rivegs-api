import {SignInDto} from './sign-in.dto';
import {MaxLength, IsNotEmpty, IsString} from 'class-validator';

export class SignUpDto extends SignInDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
    login: string;
}
