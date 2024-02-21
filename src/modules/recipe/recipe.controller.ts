import mongoose from 'mongoose';
import {IFilter} from './types/filter';
import {RecipeService} from './recipe.service';
import {AuthGuard} from '../auth/guards/auth.guard';
import {ImageService} from '../image/image.service';
import {CommonService} from '../common/common.service';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {UpdateRecipeDto} from './dto/update-recipe.dto';
import {IRecipe, IRecipesPagination} from './types/recipe';
import {Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query} from '@nestjs/common';

@Controller('recipe')
export class RecipeController {
  constructor(
    private readonly imageService: ImageService,
    private readonly commonService: CommonService,
    private readonly recipeService: RecipeService,
  ) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('rate') rate?: string,
    @Query('title') title?: string,
    @Query('typeId') typeId?: string,
    @Query('recipesIds') recipesIds?: string,
      // @Query('authorLogin') authorLogin?: string,
  ): Promise<IRecipesPagination<IRecipe>> {
    const filter: Partial<IFilter> = {};
    if(rate) {
      if(Array.isArray(JSON.parse(rate as string)) && JSON.parse(rate as string).length) {
        filter.rate = {$gte: (JSON.parse(rate as string) as string[])[0], $lte: (JSON.parse(rate as string) as string[])[1]};
      } 
    }
    if(page) {
      const pageSize = 10;
      const skip = (JSON.parse(page) - 1) * pageSize;
      filter.pagination = {skip, pageSize};
    }
    if(recipesIds) {
      const ids = JSON.parse(recipesIds).map((id: string) => new mongoose.Types.ObjectId(id));
      filter._id = {$in: ids};
    }
    if(title) filter.title = {$regex: new RegExp(title, 'i')};
    if (typeId) filter.typeId = new mongoose.Types.ObjectId(typeId);
    return this.recipeService.findAll(filter, page ? JSON.parse(page) : undefined);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<string> {
    const recipe = await this.commonService.findOneRecipeAPI(id);
    await this.imageService.remove(recipe.imageId);
    return this.recipeService.remove(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IRecipe> {
    return this.recipeService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createRecipeDto: CreateRecipeDto): Promise<string> {
    return this.recipeService.create(createRecipeDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto): Promise<string> {
    return this.recipeService.update(+id, updateRecipeDto);
  }
}
