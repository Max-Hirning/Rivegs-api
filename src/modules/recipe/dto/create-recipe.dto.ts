import {Type} from 'class-transformer';
import {IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested} from 'class-validator';

class StepDTO {
  @IsString()
    id: string;

  @IsString()
    value: string;

  @IsBoolean()
    bold: boolean;

  @IsBoolean()
    italic: boolean;

  @IsBoolean()
    underlined: boolean;

  @IsString()
    _id: string;
}

class IngredientDTO {
  @IsString()
    id: string;

  @IsString()
    value: string;

  @IsBoolean()
    bold: boolean;

  @IsBoolean()
    italic: boolean;

  @IsBoolean()
    underlined: boolean;

  @IsString()
    _id: string;
}

export class CreateRecipeDto {
  @IsArray()
  @IsNotEmpty()
  @Type(() => StepDTO)
  @ValidateNested({each: true})
    steps: StepDTO[];

  @IsArray()
  @IsNotEmpty()
  @Type(() => IngredientDTO)
  @ValidateNested({each: true})
    ingredients: IngredientDTO[];

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