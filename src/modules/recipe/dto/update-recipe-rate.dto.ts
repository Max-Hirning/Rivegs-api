import {IsInt, IsNumber, Max, Min} from 'class-validator';

export class UpdateRecipeRateDto {
  @IsInt()
  @IsNumber()
  @Max(5, {message: 'Rate must be at most 5'})
  @Min(1, {message: 'Rate must be at least 1'})
    rate: number;
}