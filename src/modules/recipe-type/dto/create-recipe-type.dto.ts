import {MaxLength, IsNotEmpty, IsString} from 'class-validator';

export class CreateRecipeTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
    title: string;
}