import {MaxLength, IsNotEmpty, MinLength, IsEmail, IsString} from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
    email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
    password: string;
}
