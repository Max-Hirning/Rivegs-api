import {IsNotEmpty, IsString, IsMongoId} from 'class-validator';

export class UpdateSavedRecipesDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
    recipe: string;
}
