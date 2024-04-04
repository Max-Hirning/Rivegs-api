import {HydratedDocument} from 'mongoose';
import {Recipe} from '../schemas/recipe.schema';

export interface IUpdateRecipe extends Partial<Omit<ICreateRecipe, 'authorId'>>, Partial<Pick<IRecipe, 'rate'>> {}
export interface ICreateRecipe extends Pick<IRecipe, 'steps'|'ingredients'|'imageId'|'title'|'description'|'authorId'|'typeId'> {}

export type IRecipe = HydratedDocument<Recipe>;