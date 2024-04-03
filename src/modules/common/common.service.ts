import {Model} from 'mongoose';
import {IUser} from '../user/types/user';
import {InjectModel} from '@nestjs/mongoose';
import {IRecipe} from '../recipe/types/recipe';
import {User} from '../user/schemas/user.schema';
import {Image} from '../image/schemas/image.schema';
import {Collections} from '../../configs/collections';
import {Recipe} from '../recipe/schemas/recipe.schema';
import {IRecipeType} from '../recipe-type/types/recipe-type';
import {UserErrorMessages} from '../../configs/messages/user';
import {RecipeErrorMessages} from '../../configs/messages/recipe';
import {RecipeType} from '../recipe-type/schemas/recipe-type.schema';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {RecipeTypeErrorMessages} from '../../configs/messages/recipe-type';

@Injectable()
export class CommonService {
  constructor(
    @InjectModel(Collections.users) private readonly userModel: Model<User>,
    @InjectModel(Collections.images) private readonly imageModel: Model<Image>,
    @InjectModel(Collections.recipes) private readonly recipeModel: Model<Recipe>,
    @InjectModel(Collections.recipesTypes) private readonly recipeTypeModel: Model<RecipeType>
  ) {}

  async findManyRecipesAPI(key: 'authorId', value: string): Promise<IRecipe[]> {
    const recipes = await this.recipeModel.find({[key]: value});
    return recipes;
  }

  async findOneRecipeAPI(key: '_id', value: string, noCheck?: boolean): Promise<IRecipe> {
    const recipe = await this.recipeModel.findOne({[key]: value});
    if(!noCheck) {
      if(!recipe) throw new HttpException(RecipeErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return recipe;
  }

  async findOneRecipeTypeAPI(key: '_id', value: string, noCheck?: boolean): Promise<IRecipeType> {
    const recipeType = await this.recipeTypeModel.findOne({[key]: value});
    if(!noCheck) {
      if(!recipeType) throw new HttpException(RecipeTypeErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return recipeType;
  }

  async findOneUserAPI(key: '_id'|'email'|'login', value: string, noCheck?: boolean): Promise<IUser> {
    const user = await this.userModel.findOne({[key]: value});
    if(!noCheck) {
      if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
