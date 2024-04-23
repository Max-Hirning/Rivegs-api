import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '../../configs/collections';
import {RecipeType} from './schemas/recipe-type.schema';
import mongoose, {Model, PipelineStage} from 'mongoose';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {ICreateRecipeType, IRecipeTypeResponse, IUpdateRecipeType} from './types/recipe-type';
import {RecipeTypeErrorMessages, RecipeTypeSuccessMessages} from '../../configs/messages/recipe-type';

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
    $addFields: {
      image: {
        $arrayElemAt: ['$image.url', 0]
      },
    },
  },
  {
    $project: {
      _id: 1,
      title: 1,
      image: 1,
    },
  },
  {
    $sort: {
      title: 1 // 1 for ascending, -1 for descending
    }
  }
];

@Injectable()
export class RecipeTypeService {
  constructor(@InjectModel(Collections.recipesTypes) private readonly recipeTypeModel: Model<RecipeType>) {}

  async remove(id: string): Promise<string> {
    await this.recipeTypeModel.deleteOne({_id: id});
    return RecipeTypeSuccessMessages.removeOne;
  }

  async findAll(): Promise<IRecipeTypeResponse[]> {
    const recipeTypes = await this.recipeTypeModel.aggregate(aggregationPipeLine);
    return recipeTypes || [];
  }

  async findOne(id: string): Promise<IRecipeTypeResponse> {
    const [recipeType] = await this.recipeTypeModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        },
      },
      ...aggregationPipeLine
    ]);  
    if(!recipeType) throw new HttpException(RecipeTypeErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return recipeType;
  }

  async create(createRecipeType: ICreateRecipeType): Promise<string> {
    await this.recipeTypeModel.create(createRecipeType);
    return RecipeTypeSuccessMessages.createOne;
  }

  async update(id: string, updateRecipeType: IUpdateRecipeType): Promise<string> {
    await this.recipeTypeModel.updateOne({_id: id}, updateRecipeType);
    return RecipeTypeSuccessMessages.updateOne;
  }
}
