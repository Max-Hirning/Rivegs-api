import {IRecipeType} from './types/recipe-type';
import {ImageService} from '../image/image.service';
import {CommonService} from '../common/common.service';
import {RecipeService} from '../recipe/recipe.service';
import {RecipeTypeService} from './recipe-type.service';
import {FileInterceptor} from '@nestjs/platform-express';
import {CreateRecipeTypeDto} from './dto/create-recipe-type.dto';
import {UpdateRecipeTypeDto} from './dto/update-recipe-type.dto';
import {Controller, Get, Post, Body, Put, Param, Delete, UploadedFile, UseInterceptors, HttpException, HttpStatus} from '@nestjs/common';

@Controller('recipe-type')
export class RecipeTypeController {
  constructor(
    private readonly imageService: ImageService,
    private readonly recipeService: RecipeService,
    private readonly commonService: CommonService,
    private readonly recipeTypeService: RecipeTypeService
  ) {}

  @Get()
  async findAll(): Promise<IRecipeType[]> {
    return this.recipeTypeService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<string> {
    const {imageId} = await this.commonService.findOneRecipeTypeAPI('_id', id);
    await this.recipeService.removeAll('typeId', id); // remove all recipes
    await this.imageService.remove(imageId);
    return this.recipeTypeService.remove(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IRecipeType> {
    return this.recipeTypeService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createRecipeTypeDto: CreateRecipeTypeDto): Promise<string> {
    if(file) {
      const imageId = await this.imageService.create(file.buffer, {folder: 'Rivegs/recipe-types'});
      return this.recipeTypeService.create(createRecipeTypeDto, imageId);
    }
    throw new HttpException('Image is required', HttpStatus.BAD_REQUEST);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateRecipeTypeDto: UpdateRecipeTypeDto): Promise<string> {
    if(file) {
      const {imageId} = await this.commonService.findOneRecipeTypeAPI('_id', id);
      await this.imageService.update(imageId, file.buffer, {folder: 'Rivegs/recipe-types'});
    }
    return this.recipeTypeService.update(id, updateRecipeTypeDto);
  }
}
