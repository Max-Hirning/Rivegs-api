import {HydratedDocument} from 'mongoose';
import {Recipe} from '../schemas/recipe.schema';

export type IRecipe = HydratedDocument<Recipe>;