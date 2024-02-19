import {Injectable} from '@nestjs/common';
import {CreateRecipeTypeDto} from './dto/create-recipe-type.dto';
import {UpdateRecipeTypeDto} from './dto/update-recipe-type.dto';

@Injectable()
export class RecipeTypeService {
  create(createRecipeTypeDto: CreateRecipeTypeDto): string {
    console.log(createRecipeTypeDto);
    return 'This action adds a new recipeType';
  }

  findAll(): string {
    return 'This action returns all recipeType';
  }

  findOne(id: number): string {
    return `This action returns a #${id} recipeType`;
  }

  update(id: number, updateRecipeTypeDto: UpdateRecipeTypeDto): string {
    console.log(updateRecipeTypeDto);
    return `This action updates a #${id} recipeType`;
  }

  remove(id: number): string {
    return `This action removes a #${id} recipeType`;
  }
}
