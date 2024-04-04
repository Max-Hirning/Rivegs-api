import {IRecipe} from 'modules/recipe/types/recipe';
import {RecipeTypeService} from './recipe-type.service';
import {AuthGuard} from 'modules/auth/guards/auth.guard';
import {FileInterceptor} from '@nestjs/platform-express';
import {ImageService} from 'modules/image/image.service';
import {RecipeService} from 'modules/recipe/recipe.service';
import {CommonService} from 'modules/common/common.service';
import {ICustomRequest, IResponse} from '../../types/app.types';
import {CreateRecipeTypeDto} from './dto/create-recipe-type.dto';
import {UpdateRecipeTypeDto} from './dto/update-recipe-type.dto';
import {IRecipeTypeResponse, IUpdateRecipeType} from './types/recipe-type';
import {RecipeTypeSuccessMessages} from '../../configs/messages/recipe-type';
import {Controller, Get, Post, Body, Param, Delete, HttpStatus, Put, UseGuards, Request, HttpException, UploadedFile, UseInterceptors} from '@nestjs/common';

@Controller('recipe-type')
export class RecipeTypeController {
  constructor(
    private readonly imageService: ImageService,
    private readonly commonService: CommonService,
    private readonly recipeService: RecipeService,
    private readonly recipeTypeService: RecipeTypeService,
  ) {}

  @Get()
  async findAll(): Promise<IResponse<IRecipeTypeResponse[]>> {
    const response = await this.recipeTypeService.findAll();
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: RecipeTypeSuccessMessages.findAll,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<IRecipeTypeResponse>> {
    const response = await this.recipeTypeService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: RecipeTypeSuccessMessages.findOne,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    if(req.role !== 'Admin') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const recipeType = await this.commonService.findOneRecipeTypeAPI('_id', id);
    // delete all recipes by recipe type id
    const recipes = await this.commonService.findManyRecipesAPI('typeId', id);
    const {imagesIds, ids} = recipes.reduce((res: {imagesIds: string[], ids: string[]}, {imageId, _id}: IRecipe) => {
      res.imagesIds.push(imageId);
      res.ids.push(_id);
      return res;
    }, {imagesIds: [], ids: []});
    await this.imageService.removeAll(imagesIds); // remove all recipes images
    await this.recipeService.removeMany(ids);

    await this.imageService.removeOne(recipeType.imageId);
    const response = await this.recipeTypeService.remove(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(@Request() req: ICustomRequest, @UploadedFile() file: Express.Multer.File, @Body() createRecipeTypeDto: CreateRecipeTypeDto): Promise<IResponse<undefined>> {
    if(req.role !== 'Admin') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    if(file) {
      const imageId = await this.imageService.createOne(file.buffer, {
        folder: 'Rivegs/recipe-types',
        fetch_format: 'png',
        gravity: 'face', 
        crop: 'fill',
        height: 512, 
        width: 512, 
      });
      const response = await this.recipeTypeService.create({
        imageId,
        title: createRecipeTypeDto.title
      });
      return ({
        message: response,
        statusCode: HttpStatus.OK,
      });
    }
    throw new HttpException('Image as file is requiered', HttpStatus.BAD_REQUEST);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async update(@Request() req: ICustomRequest, @UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateRecipeTypeDto: UpdateRecipeTypeDto): Promise<IResponse<undefined>> {
    if(req.role !== 'Admin') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    if(file) {
      const recipeType = await this.commonService.findOneRecipeTypeAPI('_id', id);
      await this.imageService.updateOne(recipeType.imageId, file.buffer, {
        folder: 'Rivegs/recipe-types',
        fetch_format: 'png',
        gravity: 'face', 
        crop: 'fill',
        height: 512, 
        width: 512, 
      });
    }
    const updateRecipeType: IUpdateRecipeType = {};
    if(updateRecipeTypeDto.title) updateRecipeType.title = updateRecipeTypeDto.title;
    const response = await this.recipeTypeService.update(id, updateRecipeType);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
