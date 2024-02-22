import {DBs} from 'src/configs/DBs';
import {IFilter} from './types/filter';
import mongoose, {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {Recipe} from './schemas/recipe.schema';
import {ImageService} from '../image/image.service';
import {CommonService} from '../common/common.service';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {UpdateRecipeDto} from './dto/update-recipe.dto';
import {IRecipe, IRecipesPagination} from './types/recipe';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {RecipeErrorMessages, RecipeSuccessMessages} from 'src/configs/messages/recipe';

@Injectable()
export class RecipeService {
  constructor(
    private readonly imageService: ImageService,
    private readonly commonService: CommonService,
    @InjectModel(DBs.recipes) private readonly recipeModel: Model<Recipe>
  ) {}

  async remove(id: string): Promise<string> {
    await this.recipeModel.deleteOne({_id: id});
    return RecipeSuccessMessages.removeOne;
  }

  async findOne(id: string): Promise<IRecipe> {
    const [recipe] = await this.recipeModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
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
        $lookup: {
          as: 'author',
          from: 'users',
          foreignField: '_id',
          localField: 'authorId',
        }
      },
      {
        $lookup: {
          as: 'type',
          from: 'recipetypes',
          foreignField: '_id',
          localField: 'typeId',
        }
      },
      {
        $lookup: {
          from: 'images',
          as: 'authorImage',
          foreignField: '_id',
          localField: 'author.imageId',
        }
      },
      {
        $lookup: {
          from: 'images',
          as: 'typeImage',
          foreignField: '_id',
          localField: 'type.imageId',
        }
      },
      {
        $addFields: {
          type: {
            $mergeObjects: [
              {$arrayElemAt: ['$type', 0]},
              {
                image: {
                  $arrayElemAt: ['$typeImage.url', 0]
                }
              }
            ]
          },
          image: { 
            $arrayElemAt: ['$image', 0] 
          },
          author: {
            $mergeObjects: [
              {$arrayElemAt: ['$author', 0]},
              {
                image: {
                  $arrayElemAt: ['$authorImage.url', 0]
                }
              }
            ]
          },
        }
      },
      {
        $project: {
          _id: 1,
          type: {
            _id: 1,
            title: 1,
            image: 1,
          },
          rate: 1,
          title: 1,
          steps: 1,
          author: {
            _id: 1,
            login: 1,
            email: 1,
            image: 1,
            description: 1,
            savedRecipes: 1,
          },
          description: 1,
          ingredients: 1,
          image: '$image.url',
        }
      }
    ]);
    if(!recipe) throw new HttpException(RecipeErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return recipe;
  }

  async updateRate(id: string, rate: number): Promise<string> {
    await this.recipeModel.updateOne({_id: id}, {rate});
    return RecipeSuccessMessages.updateOne;
  }

  async removeAll(search: {[key: string]: unknown}): Promise<string> {
    const recipes = await this.commonService.findRecipesAPI(search);
    const recipesIds = recipes.map(({_id}: IRecipe) => _id);
    await this.imageService.removeAll('Rivegs/recipes', recipesIds); // remove all recipes images
    await this.recipeModel.deleteMany({_id: {$in: recipesIds}});
    return RecipeSuccessMessages.removeAll;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<string> {
    await this.recipeModel.updateOne({_id: id}, {
      steps: updateRecipeDto.steps,
      title: updateRecipeDto.title,
      typeId: updateRecipeDto.typeId,
      description: updateRecipeDto.description,
      ingredients: updateRecipeDto.ingredients,
    });
    return RecipeSuccessMessages.updateOne;
  }

  async create(createRecipeDto: CreateRecipeDto, imageId: string): Promise<string> {
    await this.recipeModel.create({
      rate: 3,
      imageId,
      steps: createRecipeDto.steps,
      title: createRecipeDto.title,
      typeId: createRecipeDto.typeId,
      authorId: createRecipeDto.authorId,
      description: createRecipeDto.description,
      ingredients: createRecipeDto.ingredients,
    });
    return RecipeSuccessMessages.createOne;
  }

  async findAll({pagination, ...filters}: Partial<IFilter>, page?: number): Promise<IRecipesPagination<IRecipe>> {
    const aggregationPipeline = [];
    if(page) aggregationPipeline.concat([      
      {
        $skip: pagination.skip
      },
      {
        $limit: pagination.pageSize
      }
    ]);
    console.log(filters);
    let nextPage = null, previousPage = null;
    let totalRecipes: number, totalPages: number;
    const recipes = await this.recipeModel.aggregate([
      { // for searching by author login
        $lookup: {
          as: 'author',
          from: 'users',
          foreignField: '_id',
          localField: 'authorId',
        }
      },
      {
        $match: filters
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
        $lookup: {
          as: 'type',
          from: 'recipetypes',
          foreignField: '_id',
          localField: 'typeId',
        }
      },
      {
        $lookup: {
          from: 'images',
          as: 'authorImage',
          foreignField: '_id',
          localField: 'author.imageId',
        }
      },
      {
        $lookup: {
          from: 'images',
          as: 'typeImage',
          foreignField: '_id',
          localField: 'type.imageId',
        }
      },
      {
        $addFields: {
          type: {
            $mergeObjects: [
              {$arrayElemAt: ['$type', 0]},
              {
                image: {
                  $arrayElemAt: ['$typeImage.url', 0]
                }
              }
            ]
          },
          image: { 
            $arrayElemAt: ['$image', 0] 
          },
          author: {
            $mergeObjects: [
              {$arrayElemAt: ['$author', 0]},
              {
                image: {
                  $arrayElemAt: ['$authorImage.url', 0]
                }
              }
            ]
          },
        }
      },
      {
        $project: {
          _id: 1,
          type: {
            _id: 1,
            title: 1,
            image: 1,
          },
          rate: 1,
          title: 1,
          steps: 1,
          author: {
            _id: 1,
            login: 1,
            email: 1,
            image: 1,
            description: 1,
            savedRecipes: 1,
          },
          description: 1,
          ingredients: 1,
          image: '$image.url',
        }
      }
    ]);
    if(page) {
      totalRecipes = await this.recipeModel.countDocuments(filters);
      totalPages = Math.ceil(totalRecipes / pagination.pageSize);
      previousPage = page > 1 ? page - 1 : null;
      nextPage = page < totalPages ? page + 1 : null;
    }
    if(recipes.length === 0) throw new HttpException(RecipeErrorMessages.findAll, HttpStatus.NOT_FOUND);
    return ({
      data: recipes,
      page: page || null,
      next: nextPage || null,
      previous: previousPage || null,
      totalPages: totalPages || null
    });
  }
}
