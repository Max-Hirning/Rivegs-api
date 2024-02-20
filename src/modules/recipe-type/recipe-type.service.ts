import {DBs} from 'src/configs/DBs';
import mongoose, {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {IRecipeType} from './types/recipe-type';
import {RecipeType} from './schemas/recipe-type.schema';
import {CreateRecipeTypeDto} from './dto/create-recipe-type.dto';
import {UpdateRecipeTypeDto} from './dto/update-recipe-type.dto';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';

@Injectable()
export class RecipeTypeService {
  constructor(@InjectModel(DBs.recipesTypes) private readonly recipeTypeModel: Model<RecipeType>) {}

  async findAll(): Promise<IRecipeType[]> {
    const recipeType = await this.recipeTypeModel.aggregate([
      {
        $lookup: {
          as: 'image',
          from: 'images',
          foreignField: '_id',
          localField: 'imageId',
        }
      },
      {
        $addFields: {
          image: {$arrayElemAt: ['$image.url', 0]}
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          image: 1,
        }
      }
    ]);
    if(!recipeType || recipeType.length === 0) throw new HttpException('No recipe types', HttpStatus.NOT_FOUND);
    return recipeType;
  }

  async remove(id: string): Promise<string> { // remove all recipes
    await this.recipeTypeModel.deleteOne({_id: id});
    return 'Recipe type was removed';
  }

  async findOne(id: string): Promise<IRecipeType> {
    const [recipeType] = await this.recipeTypeModel.aggregate([
      {
        $match: {_id: new mongoose.Types.ObjectId(id)}
      },
      {
        $lookup: {
          as: 'image',
          from: 'images',
          foreignField: '_id',
          localField: 'imageId',
        }
      },
      {
        $addFields: {
          image: {$arrayElemAt: ['$image.url', 0]}
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          image: 1,
        }
      }
    ]);
    if(!recipeType) throw new HttpException('No such recipe type', HttpStatus.NOT_FOUND);
    return recipeType;
  }

  async update(id: string, updateRecipeTypeDto: UpdateRecipeTypeDto): Promise<string> {
    await this.recipeTypeModel.updateOne({_id: id}, {
      title: updateRecipeTypeDto.title,
    });
    return 'Recipe type was updated';
  }

  async create(createRecipeTypeDto: CreateRecipeTypeDto, imageId: string): Promise<string> {
    await this.recipeTypeModel.create({
      imageId, 
      title: createRecipeTypeDto.title,
    });
    return 'Recipe type was created';
  }
}
