import {HydratedDocument} from 'mongoose';
import {RecipeType} from '../schemas/recipe-type.schema';

export interface IRecipeTypeResponse extends Pick<IRecipeType, 'title'> {
  image: string;
}
export interface ICreateRecipeType extends Pick<IRecipeType, 'title'|'imageId'> {}
export interface IUpdateRecipeType extends Partial<Pick<ICreateRecipeType, 'title'>> {}

export type IRecipeType = HydratedDocument<RecipeType>;