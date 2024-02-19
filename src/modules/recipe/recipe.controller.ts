import {RecipeService} from './recipe.service';
import {AuthGuard} from '../auth/guards/auth.guard';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {UpdateRecipeDto} from './dto/update-recipe.dto';
import {Controller, Get, Post, Body, Put, Param, Delete, UseGuards} from '@nestjs/common';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  findAll(): string {
    return this.recipeService.findAll();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string): string {
    return this.recipeService.remove(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.recipeService.findOne(+id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createRecipeDto: CreateRecipeDto): string {
    return this.recipeService.create(createRecipeDto);
  }


  @Put(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto): string {
    return this.recipeService.update(+id, updateRecipeDto);
  }
}
