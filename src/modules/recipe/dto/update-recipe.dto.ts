import {CreateRecipeDto} from './create-recipe.dto';
import {OmitType, PartialType} from '@nestjs/mapped-types';

export class UpdateRecipeDto extends PartialType(OmitType(CreateRecipeDto, ['authorId'])) {}