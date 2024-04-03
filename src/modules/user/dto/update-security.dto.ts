import {IsNotEmpty, IsString, MaxLength, MinLength} from 'class-validator';

export class UpdateSecurityDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
    password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
    oldPassword: string;
}
