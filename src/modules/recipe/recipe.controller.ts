import mongoose from 'mongoose';
import {IFilter} from './types/filter';
import {IResponse} from 'src/types/response';
import {RecipeService} from './recipe.service';
import {AuthGuard} from '../auth/guards/auth.guard';
import {ImageService} from '../image/image.service';
import {CommonService} from '../common/common.service';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {UpdateRecipeDto} from './dto/update-recipe.dto';
import {FileInterceptor} from '@nestjs/platform-express';
import {IRecipe, IRecipesPagination} from './types/recipe';
import {UpdateRecipeRateDto} from './dto/update-recipe-rate.dto';
import {RecipeSuccessMessages} from 'src/configs/messages/recipe';
import {Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, HttpException, HttpStatus} from '@nestjs/common';

@Controller('recipe')
export class RecipeController {
  constructor(
    private readonly imageService: ImageService,
    private readonly commonService: CommonService,
    private readonly recipeService: RecipeService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('rate') rate?: string,
    @Query('title') title?: string,
    @Query('typeId') typeId?: string,
    @Query('recipesIds') recipesIds?: string,
    @Query('authorLogin') authorLogin?: string,
  ): Promise<IResponse<IRecipesPagination<IRecipe>>> {
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
    if(typeId) filter.typeId = new mongoose.Types.ObjectId(typeId);
    const response = await this.recipeService.findAll(filter, page ? JSON.parse(page) : undefined);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: RecipeSuccessMessages.findOne,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<IRecipe>> {
    const response = await this.recipeService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: RecipeSuccessMessages.findOne,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<IResponse<undefined>> {
    const recipe = await this.commonService.findOneRecipeAPI('_id', id);
    await this.imageService.remove(recipe.imageId);
    const response = await this.recipeService.remove(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put('rate/:id')
  @UseGuards(AuthGuard)
  async updateRate(@Param('id') id: string, @Body() updateRecipeRateDto: UpdateRecipeRateDto): Promise<IResponse<undefined>> {
    const {rate} = await this.commonService.findOneRecipeAPI('_id', id);
    const response = await this.recipeService.updateRate(id, Math.round((updateRecipeRateDto.rate+(rate || 3))/2));
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createRecipeDto: CreateRecipeDto): Promise<IResponse<undefined>> {
    if(file) {
      if(!Array.isArray(createRecipeDto.steps)) createRecipeDto.steps = JSON.parse(createRecipeDto.steps);
      if(!Array.isArray(createRecipeDto.ingredients)) createRecipeDto.ingredients = JSON.parse(createRecipeDto.ingredients);
      const imageId = await this.imageService.create(file.buffer, {folder: `Rivegs/recipes/${createRecipeDto.authorId}`});
      const response = await this.recipeService.create(createRecipeDto, imageId);
      return ({
        message: response,
        statusCode: HttpStatus.CREATED,
      });
    }
    throw new HttpException('Image is required', HttpStatus.BAD_REQUEST);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto): Promise<IResponse<undefined>> {
    if(file) {
      const {imageId, authorId} = await this.commonService.findOneRecipeAPI('_id', id);
      await this.imageService.update(imageId, file.buffer, {folder: `Rivegs/recipes/${authorId}`});
    }
    if(updateRecipeDto.steps) {
      if(!Array.isArray(updateRecipeDto.steps)) updateRecipeDto.steps = JSON.parse(updateRecipeDto.steps);
    }
    if(updateRecipeDto.ingredients) {
      if(!Array.isArray(updateRecipeDto.ingredients)) updateRecipeDto.ingredients = JSON.parse(updateRecipeDto.ingredients);
    }
    const response = await this.recipeService.update(id, updateRecipeDto);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
