import mongoose from 'mongoose';
import {IFilters} from './types/filters';
import {RecipeService} from './recipe.service';
import {IRecipe, IUpdateRecipe} from './types/recipe';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {UpdateRecipeDto} from './dto/update-recipe.dto';
import {IPagintaion} from '../../types/pagination.types';
import {FileInterceptor} from '@nestjs/platform-express';
import {ImageService} from '../../modules/image/image.service';
import {AuthGuard} from '../../modules/auth/guards/auth.guard';
import {ICustomRequest, IResponse} from '../../types/app.types';
import {UpdateRecipeRateDto} from './dto/update-recipe-rate.dto';
import {CommonService} from '../../modules/common/common.service';
import {RecipeSuccessMessages} from '../../configs/messages/recipe';
import {Controller, Get, Post, Body, Param, Delete, Put, HttpStatus, UseGuards, Request, HttpException, UploadedFile, UseInterceptors, Query} from '@nestjs/common';

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
  ): Promise<IResponse<IPagintaion<IRecipe[]>>> {
    const filter: Partial<IFilters> = {};
    if(rate) {
      if(Array.isArray(JSON.parse(rate as string)) && JSON.parse(rate as string).length) {
        filter.rate = {$gte: (JSON.parse(rate as string) as string[])[0], $lte: (JSON.parse(rate as string) as string[])[1]};
      } 
    }
    if(recipesIds) {
      const ids = JSON.parse(recipesIds).map((id: string) => new mongoose.Types.ObjectId(id));
      if(ids.length > 0) filter._id = {$in: ids};
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
  async remove(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    const recipe = await this.commonService.findOneRecipeAPI('_id', id);
    if(req._id !== recipe.authorId.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    await this.imageService.removeOne(recipe.imageId);
    const response = await this.recipeService.remove(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put('rate/:id')
  @UseGuards(AuthGuard)
  async updateRate(@Param('id') id: string, @Body() updateRecipeRateDto: UpdateRecipeRateDto): Promise<IResponse<undefined>> {
    const recipe = await this.commonService.findOneRecipeAPI('_id', id);
    const newRate = (recipe.rate + updateRecipeRateDto.rate)/2;
    const response = await this.recipeService.update(id, {rate: (updateRecipeRateDto.rate > recipe.rate) ? Math.ceil(newRate) : Math.floor(newRate)});
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(@Request() req: ICustomRequest, @UploadedFile() file: Express.Multer.File, @Body() createRecipeDto: CreateRecipeDto): Promise<IResponse<undefined>> {
    if(req._id !== createRecipeDto.authorId.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    await this.commonService.findOneUserAPI('_id', createRecipeDto.authorId);
    await this.commonService.findOneRecipeTypeAPI('_id', createRecipeDto.typeId);
    const response = await this.recipeService.create({
      title: createRecipeDto.title,
      typeId: createRecipeDto.typeId,
      authorId: createRecipeDto.authorId,
      steps: JSON.parse(createRecipeDto.steps),
      description: createRecipeDto.description,
      ingredients: JSON.parse(createRecipeDto.ingredients),
      imageId: await this.imageService.createOne(file.buffer, {
        folder: `Rivegs/recipes/${createRecipeDto.authorId}`,
        fetch_format: 'png',
        crop: 'fill',
      }),
    });
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async update(@Request() req: ICustomRequest, @Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateRecipeDto: UpdateRecipeDto): Promise<IResponse<undefined>> {
    const recipe = await this.commonService.findOneRecipeAPI('_id', id);
    if(req._id !== recipe.authorId.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const updateRecipe: IUpdateRecipe = {};
    if(file) {
      await this.imageService.updateOne(recipe.imageId, file.buffer, {
        folder: `Rivegs/recipes/${recipe.authorId}`,
        fetch_format: 'png',
        crop: 'fill',
      });
    }
    if(updateRecipeDto.typeId) {
      await this.commonService.findOneRecipeTypeAPI('_id', updateRecipeDto.typeId);
      updateRecipe.typeId = updateRecipeDto.typeId;
    }
    if(updateRecipeDto.title) updateRecipe.title = updateRecipeDto.title;
    if(updateRecipeDto.steps) updateRecipe.steps = JSON.parse(updateRecipeDto.steps);
    if(updateRecipeDto.description) updateRecipe.description = updateRecipeDto.description;
    if(updateRecipeDto.ingredients) updateRecipe.ingredients = JSON.parse(updateRecipeDto.ingredients);
    const response = await this.recipeService.update(id, updateRecipe);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
