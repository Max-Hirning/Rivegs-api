import {RecipeTypeService} from './recipe-type.service';
import {CreateRecipeTypeDto} from './dto/create-recipe-type.dto';
import {UpdateRecipeTypeDto} from './dto/update-recipe-type.dto';
import {Controller, Get, Post, Body, Put, Param, Delete} from '@nestjs/common';

@Controller('recipe-type')
export class RecipeTypeController {
  constructor(private readonly recipeTypeService: RecipeTypeService) {}

  @Post()
  create(@Body() createRecipeTypeDto: CreateRecipeTypeDto): string {
    return this.recipeTypeService.create(createRecipeTypeDto);
  }

  @Get()
  findAll(): string {
    return this.recipeTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.recipeTypeService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRecipeTypeDto: UpdateRecipeTypeDto): string {
    return this.recipeTypeService.update(+id, updateRecipeTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return this.recipeTypeService.remove(+id);
  }
}
