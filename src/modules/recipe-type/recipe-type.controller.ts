import {IResponse} from 'src/types/app.types';
import {RecipeTypeService} from './recipe-type.service';
import {CreateRecipeTypeDto} from './dto/create-recipe-type.dto';
import {UpdateRecipeTypeDto} from './dto/update-recipe-type.dto';
import {RecipeTypeSuccessMessages} from 'src/configs/messages/recipe-type';
import {Controller, Get, Post, Body, Param, Delete, HttpStatus, Put} from '@nestjs/common';

@Controller('recipe-type')
export class RecipeTypeController {
  constructor(private readonly recipeTypeService: RecipeTypeService) {}

  @Get()
  async findAll(): Promise<IResponse<undefined>> {
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeTypeSuccessMessages.findAll,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IResponse<undefined>> {
    console.log(id);
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeTypeSuccessMessages.removeOne,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<undefined>> {
    console.log(id);
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeTypeSuccessMessages.findOne,
    });
  }

  @Post()
  async create(@Body() createRecipeTypeDto: CreateRecipeTypeDto): Promise<IResponse<undefined>> {
    console.log(createRecipeTypeDto);
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeTypeSuccessMessages.createOne,
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRecipeTypeDto: UpdateRecipeTypeDto): Promise<IResponse<undefined>> {
    console.log(id, updateRecipeTypeDto);
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeTypeSuccessMessages.updateOne,
    });
  }
}
