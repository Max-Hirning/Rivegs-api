import {IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';

export class UpdateProfileDto {
  @IsEmail()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
    email: string;
  
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(50)
    login: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(300)
    description: string;
}
