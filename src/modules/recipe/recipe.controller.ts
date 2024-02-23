import mongoose from 'mongoose';
import {IFilter} from './types/filter';
import {RecipeService} from './recipe.service';
import {AuthGuard} from '../auth/guards/auth.guard';
import {ImageService} from '../image/image.service';
import {CommonService} from '../common/common.service';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {UpdateRecipeDto} from './dto/update-recipe.dto';
import {FileInterceptor} from '@nestjs/platform-express';
import {IRecipe, IRecipesPagination} from './types/recipe';
import {UpdateRecipeRateDto} from './dto/update-recipe-rate.dto';
import {Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, HttpException, HttpStatus} from '@nestjs/common';

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
    @Query('authorLogin') authorLogin?: string,
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
      if (ids.length > 0) filter._id = {$in: ids};
    }  
    if(authorLogin) {
      filter['author.login'] = authorLogin;
    }
    if(title) filter.title = {$regex: new RegExp(title, 'i')};
    if (typeId) filter.typeId = new mongoose.Types.ObjectId(typeId);
    return this.recipeService.findAll(filter, page ? JSON.parse(page) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IRecipe> {
    return this.recipeService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<string> {
    const recipe = await this.commonService.findOneRecipeAPI('_id', id);
    await this.imageService.remove(recipe.imageId);
    return this.recipeService.remove(id);
  }

  @Put('rate/:id')
  @UseGuards(AuthGuard)
  async updateRate(@Param('id') id: string, @Body() updateRecipeRateDto: UpdateRecipeRateDto): Promise<string> {
    const {rate} = await this.commonService.findOneRecipeAPI('_id', id);
    return this.recipeService.updateRate(id, Math.round((updateRecipeRateDto.rate+(rate || 3))/2));
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createRecipeDto: CreateRecipeDto): Promise<string> {
    if(file) {
      if(!Array.isArray(createRecipeDto.steps)) createRecipeDto.steps = JSON.parse(JSON.parse(createRecipeDto.steps));
      if(!Array.isArray(createRecipeDto.ingredients)) createRecipeDto.ingredients = JSON.parse(JSON.parse(createRecipeDto.ingredients));
      const imageId = await this.imageService.create(file.buffer, {folder: `Rivegs/recipes/${createRecipeDto.authorId}`});
      return this.recipeService.create(createRecipeDto, imageId);
    }
    throw new HttpException('Image is required', HttpStatus.BAD_REQUEST);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto): Promise<string> {
    if(file) {
      const {imageId, authorId} = await this.commonService.findOneRecipeAPI('_id', id);
      await this.imageService.update(imageId, file.buffer, {folder: `Rivegs/recipes/${authorId}`});
    }
    if(updateRecipeDto.steps) {
      if(!Array.isArray(updateRecipeDto.steps)) updateRecipeDto.steps = JSON.parse(JSON.parse(updateRecipeDto.steps));
    }
    if(updateRecipeDto.ingredients) {
      if(!Array.isArray(updateRecipeDto.ingredients)) updateRecipeDto.ingredients = JSON.parse(JSON.parse(updateRecipeDto.ingredients));
    }
    return this.recipeService.update(id, updateRecipeDto);
  }
}
