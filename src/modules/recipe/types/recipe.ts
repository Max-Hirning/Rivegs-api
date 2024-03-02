import {HydratedDocument} from 'mongoose';
import {Recipe} from '../schemas/recipe.schema';

export interface IRecipesPagination<T> {
  data: T[];
  page: number|null;
  next: number|null;
  totalPages: number;
  previous: number|null;
}

export type IRecipe = HydratedDocument<Recipe>;