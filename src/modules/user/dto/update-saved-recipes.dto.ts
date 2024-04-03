import {IsMongoId, IsNotEmpty, IsString} from 'class-validator';

export class UpdateSavedRecipesDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
    recipe: string;
}
