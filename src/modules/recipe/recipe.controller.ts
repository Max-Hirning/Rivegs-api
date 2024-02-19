import {RecipeService} from './recipe.service';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {UpdateRecipeDto} from './dto/update-recipe.dto';
import {Controller, Get, Post, Body, Put, Param, Delete} from '@nestjs/common';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  create(@Body() createRecipeDto: CreateRecipeDto): string {
    return this.recipeService.create(createRecipeDto);
  }

  @Get()
  findAll(): string {
    return this.recipeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.recipeService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto): string {
    return this.recipeService.update(+id, updateRecipeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return this.recipeService.remove(+id);
  }
}
