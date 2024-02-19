import {HydratedDocument} from 'mongoose';
import {RecipeType} from '../schemas/recipe-type.schema';

export type IRecipeType = HydratedDocument<RecipeType>;