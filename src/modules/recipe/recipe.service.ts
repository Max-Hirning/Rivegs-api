import {Injectable} from '@nestjs/common';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {UpdateRecipeDto} from './dto/update-recipe.dto';

@Injectable()
export class RecipeService {
  create(createRecipeDto: CreateRecipeDto): string {
    console.log(createRecipeDto);
    return 'This action adds a new recipe';
  }

  findAll(): string {
    return 'This action returns all recipe';
  }

  findOne(id: number): string {
    return `This action returns a #${id} recipe`;
  }

  update(id: number, updateRecipeDto: UpdateRecipeDto): string {
    console.log(updateRecipeDto);
    return `This action updates a #${id} recipe`;
  }

  remove(id: number): string {
    return `This action removes a #${id} recipe`;
  }
}
