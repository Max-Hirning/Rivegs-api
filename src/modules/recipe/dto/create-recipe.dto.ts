import {Transform, Type} from 'class-transformer';
import {IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested} from 'class-validator';

class StepIngredientDTO {
  @IsString()
  @IsNotEmpty()
    value: string;

  @IsBoolean()
    bold: boolean;

  @IsBoolean()
    italic: boolean;

  @IsBoolean()
    underlined: boolean;
}

export class CreateRecipeDto {
  @IsArray()
  @IsNotEmpty()
  @Transform(({value}) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  })
  @ValidateNested({each: true})
  @Type(() => StepIngredientDTO)
    steps: string;

  @IsArray()
  @IsNotEmpty()
  @Transform(({value}) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  })
  @ValidateNested({each: true})
  @Type(() => StepIngredientDTO)
    ingredients: string;

  @IsString()
  @IsNotEmpty()
    title: string;

  @IsString()
  @IsOptional()
    description: string;

  @IsString()
  @IsMongoId()
  @IsNotEmpty()
    authorId: string;

  @IsString()
  @IsMongoId()
  @IsNotEmpty()
    typeId: string;
}