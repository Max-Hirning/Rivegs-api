import {IsNotEmpty, IsNumber} from 'class-validator';

export class UpdateRecipeRateDto {
  @IsNumber()
  @IsNotEmpty()
    rate: number;
}
