import {IFilters} from './types/filters';
import {InjectModel} from '@nestjs/mongoose';
import {Recipe} from './schemas/recipe.schema';
import {Collections} from 'configs/collections';
import {IPagintaion} from 'types/pagination.types';
import mongoose, {Model, PipelineStage} from 'mongoose';
import {ICreateRecipe, IRecipe, IUpdateRecipe} from './types/recipe';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {RecipeErrorMessages, RecipeSuccessMessages} from 'configs/messages/recipe';

const aggregationPipeLine: PipelineStage[] = [
  {
    $lookup: {
      as: 'image',
      from: 'images',
      foreignField: '_id',
      localField: 'imageId',
    },
  },
  {
    $lookup: {
      as: 'author',
      from: 'users',
      foreignField: '_id',
      localField: 'authorId',
    },
  },
  {
    $lookup: {
      as: 'type',
      from: 'recipetypes',
      foreignField: '_id',
      localField: 'typeId',
    },
  },
  {
    $lookup: {
      from: 'images',
      as: 'typeImage',
      foreignField: '_id',
      localField: 'type.imageId',
    },
  },
  {
    $lookup: {
      from: 'images',
      as: 'authorAvatar',
      foreignField: '_id',
      localField: 'author.imageId',
    },
  },
  {
    $lookup: {
      as: 'recipes',
      from: 'recipes',
      localField: 'author._id',
      foreignField: 'authorId',
    },
  },
  {
    $addFields: {
      type: {
        $arrayElemAt: ['$type', 0]
      },
      image: {
        $arrayElemAt: ['$image.url', 0]
      },
      author: {
        $arrayElemAt: ['$author', 0]
      },
    },
  },
  {
    $addFields: {
      'type.image': {
        $arrayElemAt: ['$typeImage.url', 0]
      },
      'author.avatar': {
        $arrayElemAt: ['$authorAvatar.url', 0]
      },
      'author.recipeIds': '$recipes._id',
    },
  },
  {
    $project: {
      _id: 1,
      rate: 1,
      title: 1,
      image: 1,
      steps: 1,
      'type._id': 1,
      description: 1,
      ingredients: 1,
      'type.title': 1,
      'type.image': 1,
      'author._id': 1,
      'author.login': 1,
      'author.email': 1,
      'author.avatar': 1,
      'author.recipeIds': 1,
      'author.description': 1,
    },
  },
];

@Injectable()
export class RecipeService {
  constructor(@InjectModel(Collections.recipes) private readonly recipeModel: Model<Recipe>) {}

  async remove(id: string): Promise<string> {
    await this.recipeModel.deleteOne({_id: id});
    return RecipeSuccessMessages.removeOne;
  }

  async findOne(id: string): Promise<IRecipe> {
    const [recipe] = await this.recipeModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        },
      },
      ...aggregationPipeLine
    ]);  
    if(!recipe) throw new HttpException(RecipeErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return recipe;
  }

  async removeMany(ids: string[]): Promise<string> {
    await this.recipeModel.deleteMany({_id: {$in: ids}});
    return RecipeSuccessMessages.removeMany;
  }

  async create(createRecipe: ICreateRecipe): Promise<string> {
    await this.recipeModel.create(createRecipe);
    return RecipeSuccessMessages.createOne;
  }

  async update(id: string, updateRecipe: Partial<IUpdateRecipe>): Promise<string> {
    await this.recipeModel.updateOne({_id: id}, updateRecipe);
    return RecipeSuccessMessages.updateOne;
  }

  async findAll(filters: Partial<IFilters>, page?: number): Promise<IPagintaion<IRecipe[]>> {
    let totalPages = null;
    const aggregationPipeLineCopy = [...aggregationPipeLine];
    if(page) {
      const perPage = 10;
      const skip = (page - 1) * perPage;
      aggregationPipeLineCopy.push({$skip: skip});
      aggregationPipeLineCopy.push({$limit: perPage});
      const totalEntries = await this.recipeModel.countDocuments({...filters});
      totalPages = Math.ceil(totalEntries / perPage);
    }
    const recipes = await this.recipeModel.aggregate([
      {
        $lookup: {
          as: 'author',
          from: 'users',
          foreignField: '_id',
          localField: 'authorId',
        },
      },
      {
        $match: filters
      },
      ...aggregationPipeLineCopy
    ]);
    return ({
      page: page || null,
      data: recipes || [],
      totalPages: totalPages || null,
      previous: (page && page > 1) ? page - 1 : null,
      next: (page && page < totalPages) ? page + 1 : null,
    });
  }
}
