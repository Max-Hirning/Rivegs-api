import {IResponse} from 'src/types/response';
import {IRecipeType} from './types/recipe-type';
import {ImageService} from '../image/image.service';
import {AdminGuard} from '../auth/guards/admin.guard';
import {CommonService} from '../common/common.service';
import {RecipeService} from '../recipe/recipe.service';
import {RecipeTypeService} from './recipe-type.service';
import {FileInterceptor} from '@nestjs/platform-express';
import {CreateRecipeTypeDto} from './dto/create-recipe-type.dto';
import {UpdateRecipeTypeDto} from './dto/update-recipe-type.dto';
import {RecipeSuccessMessages} from 'src/configs/messages/recipe';
import {Controller, Get, Post, Body, Put, Param, Delete, UploadedFile, UseInterceptors, HttpException, HttpStatus, UseGuards} from '@nestjs/common';

@Controller('recipe-type')
export class RecipeTypeController {
  constructor(
    private readonly imageService: ImageService,
    private readonly recipeService: RecipeService,
    private readonly commonService: CommonService,
    private readonly recipeTypeService: RecipeTypeService
  ) {}

  @Get()
  async findAll(): Promise<IResponse<IRecipeType[]>> {
    const response = await this.recipeTypeService.findAll();
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: RecipeSuccessMessages.findAll,
    });
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string): Promise<IResponse<undefined>> {
    const {imageId} = await this.commonService.findOneRecipeTypeAPI('_id', id);
    await this.recipeService.removeAll('typeId', id); // remove all recipes
    await this.imageService.remove(imageId);
    const response = await this.recipeTypeService.remove(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<IRecipeType>> {
    const response = await this.recipeTypeService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: RecipeSuccessMessages.findOne,
    });
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createRecipeTypeDto: CreateRecipeTypeDto): Promise<IResponse<string>> {
    if(file) {
      const imageId = await this.imageService.create(file.buffer, {folder: 'Rivegs/recipe-types'});
      const response = await this.recipeTypeService.create(createRecipeTypeDto, imageId);
      return ({
        message: response,
        statusCode: HttpStatus.CREATED,
      });
    }
    throw new HttpException('Image is required', HttpStatus.BAD_REQUEST);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateRecipeTypeDto: UpdateRecipeTypeDto): Promise<IResponse<undefined>> {
    if(file) {
      const {imageId} = await this.commonService.findOneRecipeTypeAPI('_id', id);
      await this.imageService.update(imageId, file.buffer, {folder: 'Rivegs/recipe-types'});
    }
    const response = await this.recipeTypeService.update(id, updateRecipeTypeDto);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
